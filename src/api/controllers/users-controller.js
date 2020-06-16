const utils = require('../../utils')

class UserController {

    static async generateNonce(req, res, next) {
        const address = req.params.address
        const randomNonce = utils.generateRandomNumber()
        res.locals.address = req.params.address;
        res.locals.randomNonce = utils.generateRandomNumber();
        
        next();
    }

    static async buy(req, res, next) {
        //TODO implement bussiness logic for the buy functionallity 
        
        next();
    }
}

module.exports = UserController;