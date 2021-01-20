const nonceUtils = require('../../utils/nonceUtils')
const mongooseService = require('../../database/index.js')
const AuthValidator = require('../services/auth-service')
const APIError = require('../api-error')

class UserController {

    static async isUserRegistered(req, res, next) {
        const address = req.params.address.toLowerCase()
        const isRegistered = await mongooseService.isUserRegistered(address);

        res.status(200).json({ isRegistered });
    }

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

    
}

module.exports = UserController;