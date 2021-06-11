data "terraform_remote_state" "network" {
  backend = "s3"

  config = {
    bucket = var.network_state_bucket_name
    key = var.network_state_key
    region = var.network_state_bucket_region
    encrypt = var.network_state_bucket_is_encrypted
  }
}

data "aws_vpc" "vpc" {
  id = data.terraform_remote_state.network.outputs.vpc_id
}
