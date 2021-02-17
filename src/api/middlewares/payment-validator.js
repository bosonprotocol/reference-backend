//@ts-nocheck
const isValid = require("mongoose").isValidObjectId;

const APIError = require("./../api-error");

class PaymentValidator {
  async validatePaymentData(req, res, next) {
    const payload = req.body;

    if (!Array.isArray(payload)) {
      return next(new APIError(400, `Payload is not an array!`));
    }

    if (!(typeof payload[0] === "object")) {
      return next(
        new APIError(400, `Payload does not contain the required information!`)
      );
    }

    if (!Object.prototype.hasOwnProperty.call(payload[0], "_tokenIdVoucher")) {
      return next(
        new APIError(400, `Payload is not set to specific Voucher ID!`)
      );
    }

    next();
  }

  //TODO ObjectIDs should be validated in all routes, where applicable. Currently on payments route only.
  async validateID(req, res, next) {
    if (!isValid(req.params.voucherID)) {
      return next(new APIError(400, `Invalid Object ID!`));
    }

    next();
  }
}

module.exports = PaymentValidator;
