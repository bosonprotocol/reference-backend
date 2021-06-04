module "image_repository" {
  source  = "infrablocks/ecr-repository/aws"
  version = "2.0.0"

  repository_name = var.repository_name
}

data "aws_caller_identity" "current" {}

data "aws_iam_policy_document" "service" {
  statement {
    effect = "Allow"

    principals {
      type = "AWS"
      identifiers = var.allowed_role_arns
    }

    actions = [
      "ecr:GetDownloadUrlForLayer",
      "ecr:BatchGetImage",
      "ecr:BatchCheckLayerAvailability"
    ]
  }
}

resource "aws_ecr_repository_policy" "service" {
  repository = var.repository_name

  policy = data.aws_iam_policy_document.service.json
}
