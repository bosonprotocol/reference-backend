#!/bin/bash

aws lambda create-function --function-name "triggerWithdrawalsDev" --runtime "nodejs14.x" --role "arn:aws:iam::237351624248:role/aws-basic-lambda-executon" --timeout 900 --handler "src/index.handler" --region "us-east-2" --zip-file "fileb://./src.zip"