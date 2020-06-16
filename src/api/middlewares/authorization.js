const utils = require('../../utils')
const APIError = require('./../api-error');
const jwt = require('jsonwebtoken');

class Authorization {

    static async authorize(req, res, next) {
        res.status(200)
    }

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

    static generateAccessToken(req, res, next) {
        let payload = {
            user: req.params.address.toLowerCase()
        }
        
        // timeout to be increased, its just for demo purposes
        let autToken = jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: '10s' });
        res.send(autToken)
    }

}

module.exports = Authorization;