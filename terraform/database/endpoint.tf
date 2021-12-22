module "aws-private-endpoint" {
  source  = "infrablocks/aws-private-endpoint/mongodbatlas"
  version = "1.0.0"

  component             = var.component
  deployment_identifier = var.deployment_identifier

  region     = var.region
  vpc_id     = var.vpc_id
  subnet_ids = var.private_subnet_ids

  project_id = module.project.project_id

  allow_cidrs = var.database_allow_cidrs
}
