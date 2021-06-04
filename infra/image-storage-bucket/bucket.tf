data "aws_caller_identity" "current" {}

module "storage_bucket" {
  source  = "infrablocks/encrypted-bucket/aws"
  version = "2.0.0"

  acl = "public-read"
  bucket_name = var.image_storage_bucket_name

  tags = {
    DeploymentType = var.deployment_type
    DeploymentLabel = var.deployment_label
    DeploymentIdentifier = var.deployment_identifier
  }
}
