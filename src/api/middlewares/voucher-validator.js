const APIError = require("./../api-error");
const mongooseService = require("../../database/index.js");

class VoucherValidator {
  static async ValidateVoucherSupplyExists(req, res, next) {
    let voucherSupply;

    try {
      voucherSupply = await mongooseService.getVoucherSupply(req.params.id);
    } catch (error) {
      return next(
        new APIError(
          404,
          `VoucherSupply with ID: ${req.params.id} does not exist!`
        )
      );
    }

    if (!voucherSupply) {
      return next(
        new APIError(400, `Voucher with ID: ${req.params.id} does not exist!`)
      );
    }

    res.locals.voucherSupply = voucherSupply;

    next();
  }

  static async ValidateCanDelete(req, res, next) {
    if (res.locals.voucherSupply.voucherOwner !== res.locals.address) {
      return next(new APIError(401, "Unauthorized."));
    }
    next();
  }

  static async ValidateCanUpdateVoucherSupply(req, res, next) {
    if (res.locals.voucherSupply.voucherOwner !== res.locals.address) {
      return next(new APIError(401, "Unauthorized."));
    }

    next();
  }

  static async ValidateDates(req, res, next) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const today = new Date(start).getTime();
    const startDateToMillis = new Date(req.body.startDate).getTime();
    const endDateToMillis = new Date(req.body.expiryDate).getTime();

    if (startDateToMillis < today || endDateToMillis < startDateToMillis) {
      return next(new APIError(400, "Invalid Dates."));
    }

    next();
  }
}

module.exports = VoucherValidator;
