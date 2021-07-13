data "terraform_remote_state" "domain" {
  backend = "s3"

  config = {
    bucket = var.domain_state_bucket_name
    key = var.domain_state_key
    region = var.domain_state_bucket_region
    encrypt = var.domain_state_bucket_is_encrypted
  }
}