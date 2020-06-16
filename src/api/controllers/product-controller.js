const mongoose = require('../../database/mongoose')
class ProductController {

    static async getProducts(req, res, next) {
        res.status(200).json({
            route: '/products',
            status: 200
        });
    }

    static async postProduct(req, res, next) {

        await mongoose.createProduct(req.body)

        res.status(200).json({
            route: '/products',
            status: 200
        });
    }

}

module.exports = ProductController;