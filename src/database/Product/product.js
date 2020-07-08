const Product = require('../models/Product')

class ProductService {
    static async createProduct(reqBody) {
        const product = new Product(reqBody)
        await product.save();
    }
}

module.exports = ProductService;