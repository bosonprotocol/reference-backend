#!/bin/bash

aws lambda update-function-code --function-name "triggerExpirationsDev" --zip-file "fileb://./src.zip"