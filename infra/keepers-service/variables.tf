variable "region" {}
variable "component" {}
variable "deployment_identifier" {}

variable "service_desired_count" {}

variable "secrets_bucket_name" {}

variable "version_number" {}

variable "service_name" {}
variable "container_http_port" {}

variable "token_contact_address" {}
variable "boson_router_contact_address" {}
variable "voucher_kernel_address" {}
variable "alchemy_url" {}
variable "api_url" {}
variable "gcloud_keepers_secret" {}

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

variable "service_state_bucket_name" {}
variable "service_state_key" {}
variable "service_state_bucket_region" {}
variable "service_state_bucket_is_encrypted" {}

