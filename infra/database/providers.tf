provider "aws" {
  region = var.region
}

provider "template" {}

provider "mongodbatlas" {
  public_key = var.mongodb_atlas_public_key
  private_key = var.mongodb_atlas_private_key
}
