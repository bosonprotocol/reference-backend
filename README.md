## About this repository
This repository is the backend for the MVP version of the Redeemeum service

## Running and Deployment
1. Create a `.env` file based on the `.env.example` file. 
`DB_CONNECTION_STRING` is the connection string to the mongodb
`TOKEN_SECRET` is a random string used in the JWT token generation
`VOUCHERS_BUCKET` is the name Bucket in a google cloud storage where the images are stored
2. Run the app via `npm start`