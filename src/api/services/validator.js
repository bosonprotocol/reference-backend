const APIError = require('./../api-error');
const jwt = require('jsonwebtoken');
const utils = require('../../utils')

class Validator {

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

    static async isSignatureVerified(address, nonce, signature) {
        const msg = '\x19Ethereum Signed Message:\n' + nonce
        const msgHash = utils.hashMessage(msg);
        const msgHashBytes = utils.arrayify(msgHash);
        const recoveredAddress = utils.recoverAddress(msgHashBytes, signature);

        if (address !== recoveredAddress) {
            return false
        }

        return true
    }

    static generateAccessToken(address) {
        const payload = {
            user: address
        }

        return jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: '10s' });
    }

    static async verifyToken(token) {
        return await jwt.verify(token, process.env.TOKEN_SECRET)
    }

}

module.exports = Validator;