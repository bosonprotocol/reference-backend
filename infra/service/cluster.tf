data "terraform_remote_state" "cluster" {
  backend = "s3"

  config = {
    bucket = var.cluster_state_bucket_name
    key = var.cluster_state_key
    region = var.cluster_state_bucket_region
    encrypt = var.cluster_state_bucket_is_encrypted
  }
}
