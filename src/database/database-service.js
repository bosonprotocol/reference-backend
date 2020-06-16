const DATABASE_COLLECTION = require('./collections.json');
const MongoClient = require('../clients/mongo-client')
const Product = require('./models/Product')

class DatabaseService {

    static async getProductById() {

    }

    static async getAllProducts() {

    }

    static async createProduct(type, price) {
        const dbClient = MongoClient.getInstance();
        const newProduct = new Product(type, price)

        await dbClient.collection(DATABASE_COLLECTION.PRODUCTS).insertOne({
            newProduct
        })
    }

    static async getNonce(address) {

        const dbClient = MongoClient.getInstance();
        const userCollection = dbClient.collection(DATABASE_COLLECTION.USERS);
        
        return (await userCollection.findOne({ address })).randomNonce;
    }

    static async preserveNonce(address, nonce) {
        const dbClient = MongoClient.getInstance();
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

module.exports = DatabaseService;