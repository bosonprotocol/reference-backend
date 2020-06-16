const dbService = require('../../database/database-service')
class ProductController {

    static async getProducts(req, res, next) {
        res.status(200).json({
            route: '/products',
            status: 200
        });
    }

    static async postProduct(req, res, next) {
        const {
            type,
            price
        } = req.body;

        await dbService.createProduct(type, price)

        res.status(200).json({
            route: '/products',
            status: 200
        });
    }

}

module.exports = ProductController;