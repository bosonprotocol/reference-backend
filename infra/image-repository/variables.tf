variable "region" {}

variable "repository_name" {}

variable "allowed_role_arns" {
  type = list(string)
  default = []
}