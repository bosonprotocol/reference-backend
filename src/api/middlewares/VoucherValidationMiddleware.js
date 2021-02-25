const ApiError = require("./../ApiError");

class VoucherValidationMiddleware {
  constructor(voucherSuppliesRepository) {
    this.voucherSuppliesRepository = voucherSuppliesRepository;
  }

  async validateVoucherSupplyExists(req, res, next) {
    let voucherSupply;

    const voucherSupplyId = req.params.id ? req.params.id : req.body.id; //Todo improve validation for set-supply-meta

    try {
      voucherSupply = await this.voucherSuppliesRepository.getVoucherSupplyById(
        voucherSupplyId
      );
    } catch (error) {
      return next(
        new ApiError(
          404,
          `VoucherSupply with ID: ${voucherSupplyId} does not exist!`
        )
      );
    }

    if (!voucherSupply) {
      return next(
        new ApiError(400, `Voucher with ID: ${voucherSupplyId} does not exist!`)
      );
    }

    res.locals.voucherSupply = voucherSupply;

    next();
  }

  async validateCanDelete(req, res, next) {
    if (res.locals.voucherSupply.voucherOwner !== res.locals.address) {
      return next(new ApiError(401, "Unauthorized."));
    }
    next();
  }

  async validateCanUpdateVoucherSupply(req, res, next) {
    if (res.locals.voucherSupply.voucherOwner !== res.locals.address) {
      return next(new ApiError(401, "Unauthorized."));
    }

    next();
  }

  async validateDates(req, res, next) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const today = new Date(start).getTime();
    const startDateToMillis = new Date(req.body.startDate).getTime();
    const endDateToMillis = new Date(req.body.expiryDate).getTime();

    if (startDateToMillis < today || endDateToMillis < startDateToMillis) {
      return next(new ApiError(400, "Invalid Dates."));
    }

    next();
  }
}

module.exports = VoucherValidationMiddleware;
