variable "region" {}

variable "deployment_type" {}
variable "deployment_label" {}
variable "deployment_identifier" {}

variable "storage_bucket_name" {}

variable "allowed_account_ids" {
  type    = list(string)
  default = []
}
