const utils = require('../../utils')
const DBService = require('../../database/database-service')

class UserController {

    static async generateNonce(req, res, next) {
        
        const address = req.params.address;
        const randomNonce = utils.generateRandomNumber();
        await DBService.preserveNonce(address, randomNonce)
        
        res.status(200).json(
            randomNonce
        );
    }

    static async buy(req, res, next) {
        DBService.buy();

        res.status(200).send();
    }
}

module.exports = UserController;