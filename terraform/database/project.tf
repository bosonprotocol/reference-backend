module "project" {
  source  = "infrablocks/project/mongodbatlas"
  version = "1.0.0"

  component             = var.component
  deployment_identifier = var.deployment_identifier

  organization_id = var.mongodb_atlas_organization_id
}
