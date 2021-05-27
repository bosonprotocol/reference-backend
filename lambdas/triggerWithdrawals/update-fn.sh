#!/bin/bash

aws lambda update-function-code --function-name "triggerWithdrawalsDev" --zip-file "fileb://./src.zip"