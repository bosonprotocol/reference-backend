//@ts-nocheck
const APIError = require('./../api-error');
const AuthService = require('../services/auth-service')

class Authentication {

    static async authenticateToken(req, res, next) {

        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        
        if (token == null) {
            return next(new APIError(401, 'Unauthorized.'))
        }

        try {
            const userObj = await AuthService.verifyToken(token)
            res.locals.address = userObj.user.toLowerCase()
        } catch (error) {
            return next(new APIError(403, 'Forbidden.'))
        }
        
        next();
    }

}

module.exports = Authentication;