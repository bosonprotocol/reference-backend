const utils = require('../../utils')
const APIError = require('./../api-error');

class Authorization {

    static async authorize(req, res, next) {

        console.log('here should be the jwt');
        
        res.status(200)
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

module.exports = Authorization;