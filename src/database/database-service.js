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

}

module.exports = DatabaseService;