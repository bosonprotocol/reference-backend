const mongoose = require("mongoose");

const url = process.env.DB_CONNECTION_STRING;
const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
};

let instance;

module.exports = class MongooseClient {
    static getInstance() {
        if (!instance) {
            instance = MongooseClient.connect();
        }

        return instance;
    }

    static connect() {
        return mongoose.connect(url, options);
    }
};
