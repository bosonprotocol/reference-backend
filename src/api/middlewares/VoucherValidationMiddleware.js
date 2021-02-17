const ApiError = require("./../ApiError");

class VoucherValidationMiddleware {
  constructor(voucherSuppliesRepository) {
    this.voucherSuppliesRepository = voucherSuppliesRepository;
  }

  async validateVoucherSupplyExists(req, res, next) {
    let voucherSupply;

    try {
      voucherSupply = await this.voucherSuppliesRepository.getVoucherSupplyById(
        req.params.id
      );
    } catch (error) {
      return next(
        new ApiError(
          404,
          `VoucherSupply with ID: ${req.params.id} does not exist!`
        )
      );
    }

    if (!voucherSupply) {
      return next(
        new ApiError(400, `Voucher with ID: ${req.params.id} does not exist!`)
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
