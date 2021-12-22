variable "region" {}

variable "component" {}
variable "deployment_identifier" {}

variable "database_version" {}
variable "database_instance_size_name" {}
variable "database_service_user_username" {}
variable "database_service_user_password" {}
variable "database_read_only_user_username" {}
variable "database_read_only_user_password" {}
variable "database_allow_cidrs" {
  type = list(string)
}

variable "mongodb_atlas_organization_id" {}
variable "mongodb_atlas_public_key" {}
variable "mongodb_atlas_private_key" {}

variable "vpc_id" {}
variable "private_subnet_ids" {
  type = list(string)
}