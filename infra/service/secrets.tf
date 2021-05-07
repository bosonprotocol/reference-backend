locals {
  env_file_object_key = "service/environments/default.env"
}

data "template_file" "env_file_object_path" {
  template = "s3://$${secrets_bucket}/$${environment_object_key}"

  vars = {
    secrets_bucket = var.secrets_bucket_name
    environment_object_key = local.env_file_object_key
  }
}

data "template_file" "env_file" {
  template = file("${path.root}/envfiles/service.env.tpl")

  vars = {
    token_secret = var.token_secret
    gcloud_secret = var.gcloud_secret
    image_storage_bucket_name = var.image_storage_bucket_name

    database_connection_string = var.database_connection_string
    database_username = var.database_username
    database_password = var.database_password
    database_name = var.database_name
  }
}

resource "aws_s3_bucket_object" "env_file" {
  key = local.env_file_object_key
  bucket = var.secrets_bucket_name
  content = data.template_file.env_file.rendered

  server_side_encryption = "AES256"
}
