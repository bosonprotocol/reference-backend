// @ts-nocheck
const APIError = require("./../api-error");

class UserValidationMiddleware {
  constructor(vouchersRepository) {
    this.vouchersRepository = vouchersRepository;
  }

  async validateMetadata(req, res, next) {
    const voucherHolder = req.body._holder;

    if (voucherHolder.toLowerCase() !== res.locals.address) {
      return next(new APIError(403, "Forbidden."));
    }

    next();
  }

  async validateVoucherHolder(req, res, next) {
    const userVoucher = await this.vouchersRepository.getVoucherById(
      req.body._id
    );

    if (
      userVoucher._holder !== res.locals.address &&
      userVoucher.voucherOwner !== res.locals.address
    ) {
      return next(new APIError(403, "Forbidden."));
    }

    res.locals.userVoucher = userVoucher;

    next();
  }
}

module.exports = UserValidationMiddleware;
