const MongooseClient = require('../clients/mongoose-client');

const DATABASE_COLLECTION = require('./collections.json');
const Product = require('./models/Product')
const User = require('./models/User')

class MongooseService {

    static async getProductById() {

    }

    static async getAllProducts() {

    }

    static async createProduct(type, price) {
        const dbClient = MongooseClient.getInstance();
        const newProduct = new Product({type, price})

        await dbClient.collection(DATABASE_COLLECTION.PRODUCTS).insertOne({
            newProduct
        })
    }

    static async getNonce(address) {

        const dbClient = MongooseClient.getInstance();
        const userCollection = dbClient.collection(DATABASE_COLLECTION.USERS);

        return (await userCollection.findOne({ address })).randomNonce;
    }

    static async preserveNonce(address, nonce) {
        const dbClient = MongooseClient.getInstance();
        const userCollection = dbClient.collection(DATABASE_COLLECTION.USERS);

        let result = await userCollection.updateOne(
            { address: address },
            { $set: { randomNonce: nonce } }
        )

        if (!result.modifiedCount) {
            await dbClient.collection(DATABASE_COLLECTION.USERS).insertOne({
                address: address,
                randomNonce: nonce
            })
        }
    }


    static async buy() {
    }

}

module.exports = MongooseService;