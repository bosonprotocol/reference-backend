data "aws_caller_identity" "caller" {}

data "archive_file" "expirations_lambda" {
  type        = "zip"
  source_dir = "${path.cwd}/lambdas/triggerExpirations/src"
  output_path = "${path.root}/lambdas/triggerExpirations/triggerExpirations.zip"
}

data "archive_file" "finalizations_lambda" {
  type        = "zip"
  source_dir = "${path.cwd}/lambdas/triggerFinalizations/src"
  output_path = "${path.root}/lambdas/triggerFinalizations/triggerFinalizations.zip"
}

data "archive_file" "withdrawals_lambda" {
  type        = "zip"
  source_dir = "${path.cwd}/lambdas/triggerWithdrawals/src"
  output_path = "${path.root}/lambdas/triggerWithdrawals/triggerWithdrawals.zip"
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
    actions = ["iam:CreateServiceLinkedRole"]
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
  source = "infrablocks/lambda/aws"
  version = "1.0.0"

  region = var.region
  account_id = data.aws_caller_identity.caller.account_id
  component = var.component
  deployment_identifier = var.deployment_identifier

  lambda_runtime = "nodejs14.x"

  lambda_timeout = 15
  lambda_memory_size = 128

  lambda_assume_role = data.aws_iam_policy_document.assume_role_policy.json
  lambda_execution_policy = data.aws_iam_policy_document.execution_policy.json

  lambda_description = "Expirations Lambda"
  lambda_function_name = "trigger-expirations"
  lambda_handler = "index.handler"
  lambda_zip_path = data.archive_file.expirations_lambda.output_path

  deploy_in_vpc = "no"

  publish = "yes"
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

module "finalizations_lambda" {
  source = "infrablocks/lambda/aws"
  version = "1.0.0"

  region = var.region
  account_id = data.aws_caller_identity.caller.account_id
  component = var.component
  deployment_identifier = var.deployment_identifier

  lambda_runtime = "nodejs14.x"

  lambda_timeout = 15
  lambda_memory_size = 128

  lambda_assume_role = data.aws_iam_policy_document.assume_role_policy.json
  lambda_execution_policy = data.aws_iam_policy_document.execution_policy.json

  lambda_description = "Finalizations Lambda"
  lambda_function_name = "trigger-finalizations"
  lambda_handler = "index.handler"
  lambda_zip_path = data.archive_file.finalizations_lambda.output_path

  deploy_in_vpc = "no"

  publish = "yes"
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

module "withdrawals_lambda" {
  source = "infrablocks/lambda/aws"
  version = "1.0.0"

  region = var.region
  account_id = data.aws_caller_identity.caller.account_id
  component = var.component
  deployment_identifier = var.deployment_identifier

  lambda_runtime = "nodejs14.x"

  lambda_timeout = 15
  lambda_memory_size = 128

  lambda_assume_role = data.aws_iam_policy_document.assume_role_policy.json
  lambda_execution_policy = data.aws_iam_policy_document.execution_policy.json

  lambda_description = "Withdrawals Lambda"
  lambda_function_name = "trigger-withdrawals"
  lambda_handler = "index.handler"
  lambda_zip_path = data.archive_file.withdrawals_lambda.output_path

  deploy_in_vpc = "no"

  publish = "yes"
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
