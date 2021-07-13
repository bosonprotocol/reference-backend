resource "aws_iam_user" "image_storage" {
  name = substr(var.image_storage_user_name, 0, 64)

  tags = {
    DeploymentType = var.deployment_type
    DeploymentLabel = var.deployment_label
    DeploymentIdentifier = var.deployment_identifier
  }
}

resource "aws_iam_access_key" "image_storage" {
  user = aws_iam_user.image_storage.name
  pgp_key = filebase64(var.image_storage_user_public_gpg_key_path)
}

resource "aws_iam_user_policy" "image_storage" {
  name = "${var.image_storage_user_name}-policy"
  user = aws_iam_user.image_storage.name

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "s3:DeleteObject",
        "s3:GetObject",
        "s3:GetObjectAcl",
        "s3:PutObject",
        "s3:PutObjectAcl"
      ],
      "Effect": "Allow",
      "Resource": [
        "${module.storage_bucket.bucket_arn}/*"
      ]
    }
  ]
}
EOF
}