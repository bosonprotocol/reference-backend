const dbService = require('../../database/database-service')
class ProductController {

    static emptyRouter(req, res, next) {
        res.status(200).json({
            route: '/',
            status: 200
        });
    }

    static async getProducts(req, res, next) {
        res.status(200).json({
            route: '/products',
            status: 200
        });
    }

    static async postProduct(req, res, next) {
        const { type, price } = req.body;
        
        //this to go on another midlleware?
        await dbService.createProduct(type, price)
        

        res.status(200).json({
            route: '/products',
            status: 200
        });
    }

    /**
     * get information by specified param
     */
    static exampleRouterParam(req, res, next) {
        const id = req.params.id
        res.status(200).json({
            route: '/products/:id',
            id,
            status: 200
        });
    }
}

module.exports = ProductController;