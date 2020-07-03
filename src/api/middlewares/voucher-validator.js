const APIError = require('./../api-error');
const AuthService = require('../services/auth-service')

class VoucherValidator {

    static async ValidateVoucherExists(req, res, next) {

        next();
    }

    static async ValidateCanDeleteVoucher(req, res, next) {
        //the voucher may be with active status, so it should not be deleted
        next();
    }

}

module.exports = VoucherValidator;