const utils = require('../../utils')

class ProductController {

    static async generateNonce(req, res, next) {
        const address = req.params.address
        const randomNonce = utils.generateRandomNumber()
        res.locals.address = req.params.address;
        res.locals.randomNonce = utils.generateRandomNumber();
        
        next()
    }
}

module.exports = ProductController;