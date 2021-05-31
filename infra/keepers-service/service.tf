locals {
  container_name = var.service_name
}

data "terraform_remote_state" "service" {
  backend = "s3"

  config = {
    bucket  = var.service_state_bucket_name
    key     = var.service_state_key
    region  = var.service_state_bucket_region
    encrypt = var.service_state_bucket_is_encrypted
  }
}

data "template_file" "image" {
  template = "$${repository_url}:$${tag}"

  vars = {
    repository_url = data.terraform_remote_state.image_repository.outputs.repository_url
    tag            = var.version_number
  }
}

data "template_file" "task_container_definitions" {
  template = file("${path.root}/container-definitions/service.json.tpl")

  vars = {
    container_name        = local.container_name
    secrets_bucket_name   = var.secrets_bucket_name
    component             = var.component
    api_url               = "https://${data.terraform_remote_state.service.outputs.address}"
    cluster               = data.terraform_remote_state.cluster.outputs.name
    deployment_identifier = var.deployment_identifier
    env_file_object_path  = data.template_file.env_file_object_path.rendered
  }
}

module "service" {
  source  = "infrablocks/ecs-service/aws"
  version = "3.2.0"

  component             = var.component
  deployment_identifier = var.deployment_identifier

  region = var.region
  vpc_id = data.aws_vpc.vpc.id

  service_task_container_definitions = data.template_file.task_container_definitions.rendered

  service_role = aws_iam_role.service_role.arn

  service_name  = var.service_name
  service_image = data.template_file.image.rendered
  service_port  = var.container_http_port

  service_desired_count                      = var.service_desired_count
  service_deployment_maximum_percent         = 200
  service_deployment_minimum_healthy_percent = 50

  ecs_cluster_id               = data.terraform_remote_state.cluster.outputs.ecs_cluster_id
  ecs_cluster_service_role_arn = data.terraform_remote_state.cluster.outputs.ecs_service_role_arn

  attach_to_load_balancer = "no"
}
