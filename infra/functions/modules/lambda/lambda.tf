resource "null_resource" "null_resource" {

  triggers = {
    updated_at = timestamp()
  }

  provisioner "local-exec" {
    command = <<EOF
    npm install
    EOF

    working_dir = format("%s/layer/nodejs", var.lambda_code_root_dir)
  }
}

data "archive_file" "file" {
  type        = "zip"
  source_dir  = var.lambda_code_source_dir
  output_path = var.lambda_code_output_path
}

data "archive_file" "layer_zip" {
  type        = "zip"
  source_dir  = format("%s/layer", var.lambda_code_root_dir)
  output_path = format("%s/layer.zip", var.lambda_code_root_dir)

  depends_on = [
    null_resource.null_resource
  ]
}

resource "aws_lambda_layer_version" "this" {
  layer_name          = "${var.lambda_function_name}-layer"
  filename            = data.archive_file.layer_zip.output_path
  source_code_hash    = data.archive_file.layer_zip.output_base64sha256
  description         = "${var.lambda_function_name} lambda layer"
  compatible_runtimes = [var.lambda_runtime]
}

# upload zip to s3 and then update lamda function from s3
resource "aws_s3_bucket_object" "file_upload" {
  bucket = var.lambda_function_bucket_name
  key    = "functions/${var.lambda_function_name}.zip"
  source = data.archive_file.file.output_path
  server_side_encryption = "AES256"
}

resource "aws_lambda_function" "lambda" {
  function_name = var.lambda_function_name
  description   = var.lambda_description

  s3_bucket = var.lambda_function_bucket_name
  s3_key = aws_s3_bucket_object.file_upload.key

  layers = [aws_lambda_layer_version.this.arn]

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
    data.archive_file.file,
    data.archive_file.layer_zip
  ]
}
