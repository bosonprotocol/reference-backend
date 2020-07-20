const APIError = require('./../api-error');
const AuthService = require('../services/auth-service')
const mongooseService = require('../../database/index.js');
const { mongo } = require('mongoose');

class VoucherValidator {

    static async ValidateVoucherExists(req, res, next) {
        const voucher = await mongooseService.getVoucher(req.params.id);
        
        if (!voucher) {
            return next(new APIError(`Voucher with ID: ${req.params.id} does not exist!`))
        }

        res.locals.voucher = voucher

        next();
    }

    static async ValidateCanDelete(req, res, next) {
        if (res.locals.voucher.voucherOwner != res.locals.address) {
            return next(new APIError(401, 'Unauthorized.'))
        }
        next();
    }

    static async ValidateCanUpdateVoucher(req, res, next) {
        if (res.locals.voucher.voucherOwner != res.locals.address) {
            return next(new APIError(401, 'Unauthorized.'))
        }

        next();
    }

}

module.exports = VoucherValidator;