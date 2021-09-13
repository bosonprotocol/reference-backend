locals {
  env_file_object_key = "triggers-service/environments/default.env"
}

data "template_file" "env_file_object_path" {
  template = "s3://$${secrets_bucket}/$${environment_object_key}"

  vars = {
    secrets_bucket         = var.secrets_bucket_name
    environment_object_key = local.env_file_object_key
  }
}

data "template_file" "env_file" {
  template = file("${path.root}/envfiles/service.env.tpl")

  vars = {
    executor_secret       = var.executor_secret
    gcloud_keepers_secret = var.gcloud_keepers_secret
    alchemy_url           = var.alchemy_url
    etherscan_apikey      = var.etherscan_apikey
    infura_apikey         = var.infura_apikey
  }
}

resource "aws_s3_bucket_object" "env_file" {
  key     = local.env_file_object_key
  bucket  = var.secrets_bucket_name
  content = data.template_file.env_file.rendered

  server_side_encryption = "AES256"
}
