# Component / Service & AWS Account Settings

variable "region" {
  description = "The region into which to deploy the Lambda."
  type        = string
}

variable "account_id" {
  description = "AWS account id where the lambda execution"
  type        = string
}

variable "component" {
  description = "The name of the component or service"
  type        = string
}

variable "deployment_identifier" {
  description = "An identifier for this instantiation e.g. <deployment_type>-<deployment_label>"
  type        = string
}

# Lambda Settings

variable "lambda_function_bucket_name" {
  description = "S3 bucket to upload lambda functions"
  type        = string
}

variable "lambda_function_name" {
  description = "The name to use for the lambda function"
  type        = string
}

variable "lambda_description" {
  description = "The description to use for the AWS Lambda"
  type        = string
}

variable "lambda_handler" {
  description = "The name of the handler to use for the lambda function"
  type        = string
}

variable "lambda_runtime" {
  description = "The runtime to use for the lambda function"
  type        = string
  default     = "nodejs10.x"
}

variable "lambda_timeout" {
  description = "The timeout period to use for the lambda function"
  default     = 30
}

variable "lambda_memory_size" {
  description = "The amount of memeory to use for the lambda function"
  default     = 128
}

variable "lambda_execution_policy" {
  description = "The inline AWS execution policy to use for the lambda"
  type        = string
  default     = ""
}

variable "lambda_assume_role" {
  description = "An inline AWS role policy which the lambda should assume during execution"
  type        = string
  default     = ""
}

variable "lambda_environment_variables" {
  description = "Environment variables to be provided to the lambda function."
  type        = map(string)
  default     = null
}

variable "tags" {
  description = "AWS tags to use on created infrastructure components"
  type        = map(string)
  default     = {}
}

variable "lambda_code_source_dir" {
  description = "The location where the generated zip file should be stored"
  type        = string
}

variable "lambda_code_output_path" {
  description = "The location where the generated zip file should be stored"
  type        = string
}

# Deployment Options

variable "deploy_in_vpc" {
  description = "Whether or not to deploy the lambda into a VPC (\"yes\" or \"no\")."
  type        = string
  default     = "yes"
}

variable "publish" {
  description = "Whether or not to publish creation / change as a new lambda function version (\"yes\" or \"no\")."
  type        = string
  default     = "no"
}

# VPC Deployment Settings

variable "vpc_id" {
  description = "The ID of the VPC into which to deploy the lambda."
  type        = string
  default     = ""
}

variable "lambda_subnet_ids" {
  description = "The IDs of the subnets for the lambda"
  type        = list(string)
  default     = []
}

variable "lambda_ingress_cidr_blocks" {
  description = "The ingress CIDR ranges to allow access"
  type        = list(string)
  default     = []
}

variable "lambda_egress_cidr_blocks" {
  description = "The egress CIDR ranges to allow access"
  type        = list(string)
  default     = []
}
