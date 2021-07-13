[
  {
    "name": "${container_name}",
    "image": "$${image}",
    "memoryReservation": 256,
    "essential": true,
    "command": $${command},
    "portMappings": [
      {
        "containerPort": ${container_http_port},
        "hostPort": ${host_http_port}
      }
    ],
    "environment": [
      { "name": "AWS_S3_BUCKET_REGION", "value": "$${region}" },
      { "name": "AWS_S3_ENV_FILE_OBJECT_PATH", "value": "${env_file_object_path}" },
      { "name": "DEPLOYMENT_IDENTIFIER", "value": "${deployment_identifier}" },
      { "name": "SERVICE_NAME", "value": "${container_name}" },
      { "name": "SERVICE_${host_http_port}_NAME", "value": "${container_name}-http" },
      { "name": "SERVICE_${host_http_port}_CHECK_HTTP", "value": "/health" },
      { "name": "SERVICE_${host_http_port}_CHECK_INTERVAL", "value": "30s" },
      { "name": "SERVICE_${host_http_port}_CHECK_TIMEOUT", "value": "2s" },
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
