data "aws_caller_identity" "current" {}

data "template_file" "bucket_policy_template" {
  template = file("${path.module}/policies/storage-bucket-policy.json.tpl")

  vars = {
    allowed_account_ids = jsonencode(coalescelist(var.allowed_account_ids, [data.aws_caller_identity.current.account_id]))
  }
}

module "storage_bucket" {
  source  = "infrablocks/encrypted-bucket/aws"
  version = "2.0.0"

  bucket_name = var.storage_bucket_name
  bucket_policy_template = data.template_file.bucket_policy_template.rendered

  tags = {
    DeploymentType = var.deployment_type
    DeploymentLabel = var.deployment_label
    DeploymentIdentifier = var.deployment_identifier
  }
}
