data "aws_caller_identity" "current" {
}

resource "aws_iam_role" "lambda_execution_role" {
  assume_role_policy = var.lambda_assume_role != "" ? var.lambda_assume_role : jsonencode(
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        Action: "sts:AssumeRole",
        Principal: {
          "Service": "lambda.amazonaws.com"
        },
        Effect: "Allow"
      }
    ]
  })
  tags = local.tags
}

resource "aws_iam_role_policy" "lambda_execution_policy" {
  role = aws_iam_role.lambda_execution_role.id
  policy = var.lambda_execution_policy != "" ? var.lambda_execution_policy : jsonencode(
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        Effect: "Allow",
        Action: [
          "ec2:CreateNetworkInterface",
          "ec2:DescribeNetworkInterfaces",
          "ec2:DeleteNetworkInterface",
          "ec2:DescribeSecurityGroups",
          "ec2:AssignPrivateIpAddresses",
          "ec2:UnassignPrivateIpAddresses",
          "ec2:DescribeSubnets",
          "ec2:DescribeVpcs"
        ],
        Resource: [
          "*"
        ]
      },
      {
        Effect: "Allow",
        Action: [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        Resource: [
          "arn:aws:logs:${var.region}:${var.account_id}:*"
        ]
      }
    ]
  })
}

