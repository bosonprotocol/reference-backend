// @ts-nocheck
const ApiError = require("./../ApiError");

class UserValidationMiddleware {
  constructor(vouchersRepository) {
    this.vouchersRepository = vouchersRepository;
  }

  async validateMetadata(req, res, next) {
    const voucherHolder = req.body._holder;

    if (voucherHolder.toLowerCase() !== res.locals.address) {
      return next(new ApiError(403, "Forbidden."));
    }

    next();
  }

  async validateVoucherHolder(req, res, next) {
    let userVoucher;

    try {
      userVoucher = await this.vouchersRepository.getVoucherById(req.body._id);
    } catch (error) {
      return next(new ApiError(404, "Voucher not found!"));
    }

    if (
      userVoucher._holder !== res.locals.address &&
      userVoucher.voucherOwner !== res.locals.address
    ) {
      return next(new ApiError(403, "Forbidden."));
    }

    res.locals.userVoucher = userVoucher;

    next();
  }
}

module.exports = UserValidationMiddleware;