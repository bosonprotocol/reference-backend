//@ts-nocheck

const APIError = require('./../api-error');
const mongooseService = require('../../database/index.js');

class UserValidator {

    static async ValidateMetadata(req, res, next) {
        const voucherHolder = req.body._holder

        if (voucherHolder.toLowerCase() != res.locals.address) {
            return next(new APIError(403, 'Forbidden.'))
        }

        next();
    }

    static async ValidateVoucherHolder(req, res, next) {
        const userVoucher = await mongooseService.findVoucherById(req.body._id)
        
        if (userVoucher._holder != res.locals.address && userVoucher.voucherOwner != res.locals.address) {
            return next(new APIError(403, 'Forbidden.'))
        }

        res.locals.userVoucher = userVoucher;

        next();
    }

}

module.exports = UserValidator;