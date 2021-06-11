data "terraform_remote_state" "database" {
  backend = "s3"

  config = {
    bucket = var.database_state_bucket_name
    key = var.database_state_key
    region = var.database_state_bucket_region
    encrypt = var.database_state_bucket_is_encrypted
  }
}
