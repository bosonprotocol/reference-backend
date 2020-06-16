const Mongoose = require('mongoose')

const url = process.env.DB_CONNECTION_STRING
const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true
}

let instance;


module.exports = class MongoClient {
    static getInstance() {
        if (!instance) {
            instance = MongoClient.connectToMongo();
        }

        return instance;
    }

    static connectToMongo() {
        return Mongoose.connect(url, options)
    }

}