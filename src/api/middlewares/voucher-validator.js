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

    //TODO this might need to be removed as we are no longer receiving _holder on this request
    static async ValidateMetadata(req, res, next) {
        const voucherHolder = req.body._holder

        if (voucherHolder.toLowerCase() != res.locals.address) {
            return next(new APIError(403, 'Forbidden.'))
        }

        next();
    }

    static async ValidateVoucherHolder(req, res, next) {
        const userVoucher = await mongooseService.findUserVoucherById(req.body._id)
        
        if (userVoucher._holder != res.locals.address && userVoucher.voucherOwner != res.locals.address) {
            return next(new APIError(403, 'Forbidden.'))
        }

        res.locals.userVoucher = userVoucher;

        next();
    }

}

module.exports = VoucherValidator;