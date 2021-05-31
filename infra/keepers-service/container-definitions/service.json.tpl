[
  {
    "name": "${container_name}",
    "image": "$${image}",
    "memoryReservation": 256,
    "essential": true,
    "command": $${command},
    "environment": [
      { "name": "AWS_S3_BUCKET_REGION", "value": "$${region}" },
      { "name": "AWS_S3_ENV_FILE_OBJECT_PATH", "value": "${env_file_object_path}" },
      { "name": "API_URL", "value": "${api_url}" },
      { "name": "DEPLOYMENT_IDENTIFIER", "value": "${deployment_identifier}" },
      { "name": "SERVICE_NAME", "value": "${container_name}" },
      { "name": "SERVICE_TAGS", "value": "${component},${deployment_identifier},${cluster}" },
      { "name": "SERVICE_COMPONENT", "value": "${component}" },
      { "name": "SERVICE_CLUSTER", "value": "${cluster}" },
      { "name": "SERVICE_DEPLOYMENT_IDENTIFIER", "value": "${deployment_identifier}" }
    ],
    "dockerLabels": {
      "containerName": "${container_name}",
      "containerService": "${container_name}",
      "containerGroup": "services"
    },
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "$${log_group}",
        "awslogs-region": "$${region}"
      }
    }
  }
]
