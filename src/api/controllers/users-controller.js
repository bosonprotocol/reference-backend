const nonceUtils = require('../../utils/nonceUtils')
const DBService = require('../../database/database-service')
const Validator = require('../services/validator')
const APIError = require('../api-error')

class UserController {

    static async generateNonce(req, res, next) {

        const address = req.params.address;
        const randomNonce = nonceUtils.generateRandomNumber();
        await DBService.preserveNonce(address, randomNonce)
        
        res.status(200).json(
            randomNonce
        );
    }

    static async verifySignature(req, res, next) {

        const address = req.params.address
        const nonce = await DBService.getNonce(address)

        if (!await Validator.isSignatureVerified(address, nonce, req.body.signature)) {
            return next(new APIError(401, 'Unauthorized.'))
        }

        const autToken = Validator.generateAccessToken(address)        
        res.status(200).send(autToken)
    }

    static async buy(req, res, next) {
        
        await DBService.buy();
        res.status(200).send();
    }
}

module.exports = UserController;