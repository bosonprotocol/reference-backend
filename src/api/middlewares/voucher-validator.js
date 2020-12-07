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

    static async ValidateDates(req, res, next) {
        const start = new Date();
        start.setHours(0,0,0,0);
        const today = new Date(start).getTime()
        const startDateToMillis = new Date(req.body.startDate).getTime()
        const endDateToMillis = new Date(req.body.expiryDate).getTime()


        if (startDateToMillis < today || endDateToMillis < startDateToMillis) {
            return next(new APIError(400, 'Invalid Dates.'))
        }

        next();
    }

}

module.exports = VoucherValidator;