const nonceUtils = require('../../utils/nonceUtils')
const mongoose = require('../../database/mongoose')
const AuthValidator = require('../services/auth-validator')
const APIError = require('../api-error')

class UserController {

    static async generateNonce(req, res, next) {

        const address = req.params.address;
        const randomNonce = nonceUtils.generateRandomNumber();
        await mongoose.preserveNonce(address, randomNonce)
        
        res.status(200).json(
            randomNonce
        );
    }

    static async verifySignature(req, res, next) {

        const address = req.params.address
        const nonce = await mongoose.getNonce(address)

        if (!await AuthValidator.isSignatureVerified(address, nonce, req.body.signature)) {
            return next(new APIError(401, 'Unauthorized.'))
        }

        const authToken = AuthValidator.generateAccessToken(address)        
        res.status(200).send(authToken)
    }

    static async buy(req, res, next) {
        
        await mongoose.buy();
        res.status(200).send();
    }
}

module.exports = UserController;