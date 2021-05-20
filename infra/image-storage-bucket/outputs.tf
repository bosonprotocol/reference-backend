output "image_storage_bucket_name" {
  value = module.storage_bucket.bucket_name
}

output "image_storage_user_access_key_id" {
  value = aws_iam_access_key.image_storage.id
}

output "image_storage_user_secret_access_key" {
  value = aws_iam_access_key.image_storage.encrypted_secret
}
