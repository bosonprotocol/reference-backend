data "aws_caller_identity" "current" {}

module "storage_bucket" {
  source  = "infrablocks/encrypted-bucket/aws"
  version = "1.6.0"

  bucket_name = var.image_storage_bucket_name

  tags = {
    DeploymentType = var.deployment_type
    DeploymentLabel = var.deployment_label
    DeploymentIdentifier = var.deployment_identifier
  }
}
