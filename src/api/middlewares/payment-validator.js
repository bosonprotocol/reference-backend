//@ts-nocheck

const APIError = require('./../api-error');
const isValid = require('mongoose').isValidObjectId;


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

    //TODO ObjectIDs should be validated in all routes, where applicable. Currently on payments route only.
    static async ValidateID(req, res, next) {

        if (!isValid(req.params.voucherID)) {
            return next(new APIError(400, `Invalid Object ID!`))
        }

        next();
    }
}

module.exports = VoucherValidator;