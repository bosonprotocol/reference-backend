data "aws_iam_policy_document" "service_assume_role_policy_content" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      identifiers = ["ecs-tasks.amazonaws.com"]
      type        = "Service"
    }

    effect = "Allow"
  }
}

data "aws_iam_policy_document" "service_role_policy_content" {
  statement {
    actions = [
      "s3:GetObject",
    ]

    resources = [
      "arn:aws:s3:::${var.secrets_bucket_name}/*",
    ]
  }
}

resource "aws_iam_role" "service_role" {
  name = "service-role-${var.component}-${var.deployment_identifier}"

  assume_role_policy = data.aws_iam_policy_document.service_assume_role_policy_content.json
}

resource "aws_iam_role_policy" "service_role_policy" {
  role   = aws_iam_role.service_role.id
  policy = data.aws_iam_policy_document.service_role_policy_content.json
}
