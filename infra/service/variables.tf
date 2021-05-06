variable "region" {}
variable "component" {}
variable "deployment_identifier" {}

variable "service_desired_count" {}

variable "secrets_bucket_name" {}

variable "version_number" {}

variable "service_name" {}
variable "container_http_port" {}
variable "host_http_port" {}

variable "domain_state_bucket_name" {}
variable "domain_state_key" {}
variable "domain_state_bucket_region" {}
variable "domain_state_bucket_is_encrypted" {}

variable "network_state_bucket_name" {}
variable "network_state_key" {}
variable "network_state_bucket_region" {}
variable "network_state_bucket_is_encrypted" {}

variable "cluster_state_bucket_name" {}
variable "cluster_state_key" {}
variable "cluster_state_bucket_region" {}
variable "cluster_state_bucket_is_encrypted" {}

variable "image_repository_state_bucket_name" {}
variable "image_repository_state_key" {}
variable "image_repository_state_bucket_region" {}
variable "image_repository_state_bucket_is_encrypted" {}

