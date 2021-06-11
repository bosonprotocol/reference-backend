{
  "Version": "2012-10-17",
  "Statement": [
    $${deny_unencrypted_object_upload_fragment},
    $${deny_unencrypted_inflight_operations_fragment},
    {
      "Sid": "AllowCrossAccountAccess",
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:GetObject"
      ],
      "Principal": {
        "AWS": ${allowed_account_ids}
      },
      "Resource": [
        "arn:aws:s3:::$${bucket_name}",
        "arn:aws:s3:::$${bucket_name}/*"
      ]
    }
  ]
}