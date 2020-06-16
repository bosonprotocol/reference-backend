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

    static async getNonce(req, res, next) {
        const dbClient = MongoClient.getInstance();
        const userCollection = dbClient.collection(DATABASE_COLLECTION.USERS);
        const address = req.params.address
        let result = await userCollection.findOne({ address })

        res.locals.randomNonce = result.randomNonce
        next();
    }

    static async preserveNonce(req, res, next) {
        const dbClient = MongoClient.getInstance();
        const userCollection = dbClient.collection(DATABASE_COLLECTION.USERS);
       
        let result = await userCollection.updateOne(
            { address: res.locals.address },
            { $set: { randomNonce: res.locals.randomNonce } }
        )
            
        if (!result.modifiedCount) {
            await dbClient.collection(DATABASE_COLLECTION.USERS).insertOne({
                address: res.locals.address,
                randomNonce: res.locals.randomNonce
            })
        } 

        res.status(200).json(
            res.locals.randomNonce
        );
    }


    static async buy(req, res, next) {
        res.status(200).send();
    }

}

module.exports = DatabaseService;