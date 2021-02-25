output "project_id" {
  value = module.project.project_id
}

output "cluster_id" {
  value = module.cluster.cluster_id
}

output "connection_string" {
  value = module.cluster.connection_strings[0].private_endpoint[0].connection_string
}
