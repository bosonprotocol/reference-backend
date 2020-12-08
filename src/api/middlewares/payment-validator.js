//@ts-nocheck

const APIError = require('./../api-error');
const mongooseService = require('../../database/index.js');

class VoucherValidator {

    static async ValidatePaymentData(req, res, next) {
        const payload = req.body;

        if (!Array.isArray(payload)) {
            return next(new APIError(400, `Payload is not an array!`))
        }

        if (!(typeof payload[0] === 'object')) {
            return next(new APIError(400, `Payload does not contain the required information!`))
        }

        if (!payload[0].hasOwnProperty('_tokenIdVoucher')) {
            return next(new APIError(400, `Payload is not set to specific Voucher ID!`))
        }
    
        next();
    }

}

module.exports = VoucherValidator;