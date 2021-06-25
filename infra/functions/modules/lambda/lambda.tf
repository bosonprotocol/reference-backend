resource "null_resource" "null_resource" {

  triggers = {
    updated_at = timestamp()
  }

  provisioner "local-exec" {
    command = <<EOF
    npm install
    EOF

    working_dir = var.lambda_code_source_dir
  }
}

data "archive_file" "file" {
  type        = "zip"
  source_dir  = var.lambda_code_source_dir
  output_path = var.lambda_code_output_path

  depends_on = [
    null_resource.null_resource
  ]
}

resource "aws_lambda_function" "lambda" {
  function_name = var.lambda_function_name
  description   = var.lambda_description

  filename         = data.archive_file.file.output_path
  handler          = var.lambda_handler
  runtime          = var.lambda_runtime
  source_code_hash = data.archive_file.file.output_base64sha256

  role = aws_iam_role.lambda_execution_role.arn

  timeout     = var.lambda_timeout
  memory_size = var.lambda_memory_size

  publish = var.publish == "yes" ? true : false

  tags = local.tags

  dynamic "environment" {
    for_each = var.lambda_environment_variables[*]
    content {
      variables = environment.value
    }
  }

  vpc_config {
    security_group_ids = var.deploy_in_vpc == "yes" ? [aws_security_group.sg_lambda[0].id] : []
    subnet_ids         = var.deploy_in_vpc == "yes" ? var.lambda_subnet_ids : []
  }

  depends_on = [
    null_resource.null_resource,
    data.archive_file.file
  ]
}