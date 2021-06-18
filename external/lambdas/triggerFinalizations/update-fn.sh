#!/bin/bash

aws lambda update-function-code --function-name "triggerFinalizationsDev" --zip-file "fileb://./src.zip"