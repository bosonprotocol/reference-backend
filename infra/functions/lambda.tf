data "aws_caller_identity" "caller" {}
data "terraform_remote_state" "service" {
  backend = "s3"

  config = {
    bucket  = var.service_state_bucket_name
    key     = var.service_state_key
    region  = var.service_state_bucket_region
    encrypt = var.service_state_bucket_is_encrypted
  }
}

resource "aws_secretsmanager_secret" "keepers_secretsmanager_secret" {
  name = "keepersServiceSMSecrets"
}

resource "aws_secretsmanager_secret_version" "keepers_secretsmanager_secret_version" {
  secret_id = aws_secretsmanager_secret.keepers_secretsmanager_secret.id
  secret_string = jsonencode(tomap({
    gcloudsecret         = var.gcloud_keepers_secret
    cashieraddress       = var.cashier_address
    executorsecret       = var.executor_secret
    networkname          = "rinkeby"
    etherscanapikey      = var.etherscan_apikey
    infuraapikey         = var.infura_apikey
    voucherkerneladdress = var.voucher_kernel_address
    apiurl               = "https://${data.terraform_remote_state.service.outputs.address}"
  }))
}

resource "null_resource" "expirations_lambda_build" {
  triggers = {
    updated_at = timestamp()
  }

  provisioner "local-exec" {
    command = "cd ${path.cwd}/external/lambdas/triggerExpirations/src && npm install"
  }
}

data "null_data_source" "expirations_lambda_build_dep" {
  inputs = {
    source_dir = "${path.cwd}/external/lambdas/triggerExpirations/src"
  }
}

data "archive_file" "expirations_lambda" {
  type        = "zip"
  source_dir  = data.null_data_source.expirations_lambda_build_dep.outputs.source_dir
  output_path = "${path.root}/external/lambdas/triggerExpirations/triggerExpirations.zip"

  depends_on = [
    data.null_data_source.expirations_lambda_build_dep,
    null_resource.expirations_lambda_build
  ]
}

resource "null_resource" "finalizations_lambda_build" {
  triggers = {
    updated_at = timestamp()
  }

  provisioner "local-exec" {
    command = "cd ${path.cwd}/external/lambdas/triggerFinalizations/src && npm install"
  }
}

data "null_data_source" "finalizations_lambda_build_dep" {
  inputs = {
    source_dir = "${path.cwd}/external/lambdas/triggerFinalizations/src"
  }
}

data "archive_file" "finalizations_lambda" {
  type        = "zip"
  source_dir  = data.null_data_source.finalizations_lambda_build_dep.outputs.source_dir
  output_path = "${path.root}/external/lambdas/triggerFinalizations/triggerFinalizations.zip"

  depends_on = [
    data.null_data_source.finalizations_lambda_build_dep,
    null_resource.finalizations_lambda_build
  ]
}

resource "null_resource" "withdrawals_lambda_build" {
  triggers = {
    updated_at = timestamp()
  }

  provisioner "local-exec" {
    command = "cd ${path.cwd}/external/lambdas/triggerWithdrawals/src && npm install"
  }
}

data "null_data_source" "withdrawals_lambda_build_dep" {
  inputs = {
    source_dir = "${path.cwd}/external/lambdas/triggerWithdrawals/src"
  }
}

data "archive_file" "withdrawals_lambda" {
  type        = "zip"
  source_dir  = data.null_data_source.withdrawals_lambda_build_dep.outputs.source_dir
  output_path = "${path.root}/external/lambdas/triggerWithdrawals/triggerWithdrawals.zip"

  depends_on = [
    data.null_data_source.withdrawals_lambda_build_dep,
    null_resource.withdrawals_lambda_build
  ]
}

data "aws_iam_policy_document" "assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    effect = "Allow"

    principals {
      type = "Service"
      identifiers = [
        "lambda.amazonaws.com",
        "edgelambda.amazonaws.com"
      ]
    }
  }
}

data "aws_iam_policy_document" "execution_policy" {
  statement {
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = [
      "arn:aws:logs:*:${data.aws_caller_identity.caller.account_id}:*"
    ]
  }

  statement {
    actions   = ["iam:CreateServiceLinkedRole"]
    resources = ["arn:aws:iam::*:role/*"]
  }

  statement {
    actions = [
      "lambda:GetFunction",
      "lambda:EnableReplication*"
    ]
    resources = [
      "arn:aws:lambda:*:${data.aws_caller_identity.caller.account_id}:function:trigger-expirations",
      "arn:aws:lambda:*:${data.aws_caller_identity.caller.account_id}:function:trigger-finalizations",
      "arn:aws:lambda:*:${data.aws_caller_identity.caller.account_id}:function:trigger-withdrawals"
    ]
  }

  statement {
    actions = [
      "secretsmanager:GetResourcePolicy",
      "secretsmanager:GetSecretValue",
      "secretsmanager:DescribeSecret",
      "secretsmanager:ListSecretVersionIds",
      "secretsmanager:ListSecrets"
    ]
    resources = ["*"]
  }
}

module "expirations_lambda" {
  source  = "infrablocks/lambda/aws"
  version = "1.0.0"

  region                = var.region
  account_id            = data.aws_caller_identity.caller.account_id
  component             = var.component
  deployment_identifier = var.deployment_identifier

  lambda_runtime = "nodejs14.x"

  lambda_timeout     = 900
  lambda_memory_size = 128

  lambda_assume_role      = data.aws_iam_policy_document.assume_role_policy.json
  lambda_execution_policy = data.aws_iam_policy_document.execution_policy.json

  lambda_description   = "Expirations Lambda"
  lambda_function_name = "trigger-expirations"
  lambda_handler       = "index.handler"
  lambda_zip_path      = data.archive_file.expirations_lambda.output_path

  deploy_in_vpc = "no"

  publish = "yes"

  depends_on = [
    null_resource.withdrawals_lambda_build,
    data.archive_file.expirations_lambda
  ]
}

resource "aws_cloudwatch_event_rule" "expirations_lambda_cron_schedule" {
  name                = replace("trigger-expirations-cron_schedule", "/(.{0,64}).*/", "$1")
  description         = "This event will run according to a schedule for Lambda trigger-expirations"
  schedule_expression = "rate(5 minutes)"
  is_enabled          = true
}

resource "aws_cloudwatch_event_target" "expirations_lambda_event_target" {
  rule = aws_cloudwatch_event_rule.expirations_lambda_cron_schedule.name
  arn  = module.expirations_lambda.lambda_arn
}

resource "aws_lambda_permission" "expirations_lambda_permission" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = "trigger-expirations"
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.expirations_lambda_cron_schedule.arn
}

module "finalizations_lambda" {
  source  = "infrablocks/lambda/aws"
  version = "1.0.0"

  region                = var.region
  account_id            = data.aws_caller_identity.caller.account_id
  component             = var.component
  deployment_identifier = var.deployment_identifier

  lambda_runtime = "nodejs14.x"

  lambda_timeout     = 900
  lambda_memory_size = 128

  lambda_assume_role      = data.aws_iam_policy_document.assume_role_policy.json
  lambda_execution_policy = data.aws_iam_policy_document.execution_policy.json

  lambda_description   = "Finalizations Lambda"
  lambda_function_name = "trigger-finalizations"
  lambda_handler       = "index.handler"
  lambda_zip_path      = data.archive_file.finalizations_lambda.output_path

  deploy_in_vpc = "no"

  publish = "yes"

  depends_on = [
    null_resource.finalizations_lambda_build,
    data.archive_file.finalizations_lambda
  ]
}

resource "aws_cloudwatch_event_rule" "finalizations_lambda_cron_schedule" {
  name                = replace("trigger-finalizations-cron_schedule", "/(.{0,64}).*/", "$1")
  description         = "This event will run according to a schedule for Lambda trigger-finalizations"
  schedule_expression = "rate(5 minutes)"
  is_enabled          = true
}

resource "aws_cloudwatch_event_target" "finalizations_lambda_event_target" {
  rule = aws_cloudwatch_event_rule.finalizations_lambda_cron_schedule.name
  arn  = module.finalizations_lambda.lambda_arn
}

resource "aws_lambda_permission" "finalizations_lambda_permission" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = "trigger-finalizations"
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.finalizations_lambda_cron_schedule.arn
}

module "withdrawals_lambda" {
  source  = "infrablocks/lambda/aws"
  version = "1.0.0"

  region                = var.region
  account_id            = data.aws_caller_identity.caller.account_id
  component             = var.component
  deployment_identifier = var.deployment_identifier

  lambda_runtime = "nodejs14.x"

  lambda_timeout     = 900
  lambda_memory_size = 128

  lambda_assume_role      = data.aws_iam_policy_document.assume_role_policy.json
  lambda_execution_policy = data.aws_iam_policy_document.execution_policy.json

  lambda_description   = "Withdrawals Lambda"
  lambda_function_name = "trigger-withdrawals"
  lambda_handler       = "index.handler"
  lambda_zip_path      = data.archive_file.withdrawals_lambda.output_path

  deploy_in_vpc = "no"

  publish = "yes"

  depends_on = [
    null_resource.withdrawals_lambda_build,
    data.archive_file.withdrawals_lambda
  ]
}

resource "aws_cloudwatch_event_rule" "withdrawals_lambda_cron_schedule" {
  name                = replace("trigger-withdrawals-cron_schedule", "/(.{0,64}).*/", "$1")
  description         = "This event will run according to a schedule for Lambda trigger-withdrawals"
  schedule_expression = "rate(5 minutes)"
  is_enabled          = true
}

resource "aws_cloudwatch_event_target" "withdrawals_lambda_event_target" {
  rule = aws_cloudwatch_event_rule.withdrawals_lambda_cron_schedule.name
  arn  = module.withdrawals_lambda.lambda_arn
}

resource "aws_lambda_permission" "withdrawals_lambda_permission" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = "trigger-withdrawals"
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.withdrawals_lambda_cron_schedule.arn
}
