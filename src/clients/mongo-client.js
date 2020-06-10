const Client = require('mongodb').MongoClient

const url = process.env.DB_CONNECTION_STRING
const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true
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

        Client.connect(url, options, (err, database) => {
            if (err) {
                console.log(`FATAL MONGODB CONNECTION ERROR: ${err}:${err.stack}`)
                process.exit(1)
            }

            instance = database.db('api')
        })
    }

}