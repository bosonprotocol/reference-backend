terraform {
  required_version = ">= 0.14"

  required_providers {
    mongodbatlas = {
      source = "mongodb/mongodbatlas"
      version = "0.8.2"
    }
    aws      = {
      source  = "hashicorp/aws"
      version = "~> 3.29"
    }
    template = {
      source  = "hashicorp/template"
      version = "~> 2.2.0"
    }
  }

  backend "s3" {}
}
