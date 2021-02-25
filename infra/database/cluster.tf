module "cluster" {
  source  = "infrablocks/cluster/mongodbatlas"
  version = "0.2.0"

  component             = var.component
  deployment_identifier = var.deployment_identifier

  project_id = module.project.project_id

  mongo_db_major_version = var.database_version

  cloud_provider = {
    name = "AWS"
    region_name = replace(upper(var.region), "-", "_")
    instance_size_name = var.database_instance_size_name
    disk_iops = null
    volume_type = null
    backup_enabled = true
    encrypt_ebs_volume = true
    auto_scaling = {
      compute = {
        min_instance_size: null
        max_instance_size: null
      }
    }
  }

  database_users = [
    {
      username = var.database_service_user_username
      password = var.database_service_user_password
      roles = [
        {
          role_name = "readWriteAnyDatabase"
          database_name = "admin"
          collection_name = null
        }
      ]
      labels = {}
    },
    {
      username = var.database_read_only_user_username
      password = var.database_read_only_user_password
      roles = [
        {
          role_name = "readAnyDatabase"
          database_name = "admin"
          collection_name = null
        }
      ]
      labels = {}
    }
  ]
}
