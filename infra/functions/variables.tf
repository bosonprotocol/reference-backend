variable "region" {}
variable "component" {}
variable "deployment_identifier" {}
variable "build_command" {
  description = "This is the build command to execute. It can be provided as a relative path to the current working directory or as an absolute path. It is evaluated in a shell, and can use environment variables or Terraform variables."
  type        = string
  default     = ""
}

variable "build_triggers" {
  description = "A map of values which should cause the build command to re-run. Values are meant to be interpolated references to variables or attributes of other resources."
  default     = []
}
