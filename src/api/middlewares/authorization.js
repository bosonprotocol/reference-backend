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

    //authorize
    static generateAccessToken(req, res, next) {
        let payload = {
            user: req.params.address.toLowerCase()
        }
        
        // expires after half and hour (1800 seconds = 30 minutes)
        let autToken = jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: '10s' }); // this to be increased its just for demo purposes
        res.send(autToken)
    }

    // this one when the user has already been granted with the JWT
    static async authenticateToken(req, res, next) {
        
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        
        if (token == null) {
            return next(new APIError(401, 'Unauthorized.'))
        }

        try {
            const user = await jwt.verify(token, process.env.TOKEN_SECRET)
            res.locals.address = user
            
        } catch (error) {
            return next(new APIError(403, 'Forbidden.'))
        }


        next();
    }

}

module.exports = Authorization;