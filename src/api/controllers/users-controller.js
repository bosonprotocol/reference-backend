const nonceUtils = require('../../utils/nonceUtils')
const mongooseService = require('../../database/index.js')
const AuthValidator = require('../services/auth-service')
const APIError = require('../api-error')

class UserController {

    static async generateNonce(req, res, next) {

        const address = req.params.address;
        const randomNonce = nonceUtils.generateRandomNumber();
        await mongooseService.preserveNonce(address.toLowerCase(), randomNonce)
        
        res.status(200).json(
            randomNonce
        );
    }

    static async verifySignature(req, res, next) {
        const address = req.params.address
        const nonce = await mongooseService.getNonce(address.toLowerCase())

        if (!await AuthValidator.isSignatureVerified(address, nonce, req.body.signature)) {
            return next(new APIError(401, 'Unauthorized.'))
        }

        const authToken = AuthValidator.generateAccessToken(address)        
        res.status(200).send(authToken)
    }

    static async getMyVouchers(req, res, next) {
        const address = req.params.address.toLowerCase();
        const vouchers = await mongooseService.getMyVouchers(address)
        res.status(200).send({ vouchers })
    }

    static async buy(req, res, next) {
        
        await mongooseService.buy();
        res.status(200).send();
    }
}

module.exports = UserController;