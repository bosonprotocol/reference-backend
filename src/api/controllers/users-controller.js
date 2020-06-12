const APIError = require('./../api-error');
const dbService = require('../../database/database-service')
const utils = require('../../utils')

class ProductController {

    static async generateNonce(req, res, next) {
        const address = req.params.address
        const randomNonce = utils.generateRandomNumber()
        res.locals.address = req.params.address;
        res.locals.randomNonce = utils.generateRandomNumber();
        
        next()
    }

    /**
     * get information by specified param
     */
    static async verifySignature(req, res, next) {
        const address = req.params.address;
        const signature = req.body.signature
        const nonce = res.locals.randomNonce
        const msg = '\x19Ethereum Signed Message:\n' + nonce
        const msgHash = utils.hashMessage(msg);
        const msgHashBytes = utils.arrayify(msgHash);
        const recoveredAddress = utils.recoverAddress(msgHashBytes, signature);
        
        if (address !== recoveredAddress) {
            return next(new APIError(401, 'Unauthorized.'))
        }

        next();
    }
}

module.exports = ProductController;