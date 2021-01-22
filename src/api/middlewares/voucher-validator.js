const APIError = require('./../api-error');
const mongooseService = require('../../database/index.js');

//TODO to be renamed to VoucherSetValidator
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

    static async ValidateVoucherHolder(req, res, next) {
        const userVoucher = await mongooseService.findUserVoucherByTokenIdVoucher(req.body._tokenIdVoucher)

        if (userVoucher._holder != req.body._holder) {
            return next(new APIError(403, 'Forbidden.'))
        }

        res.locals.userVoucher = userVoucher;

        next();
    }

}

module.exports = VoucherValidator;