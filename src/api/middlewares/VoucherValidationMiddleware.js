const ApiError = require("../ApiError");
const voucherStatuses = require("../../utils/voucherStatuses");

class VoucherValidationMiddleware {
  constructor(vouchersRepository) {
    this.vouchersRepository = vouchersRepository;
  }

  async validateVoucherByCorrelationIdDoesNotExist(req, res, next) {
    let voucher;
    const metadata = {
      _holder: res.locals.address,
      _correlationId: req.body._correlationId,
    };

    try {
      voucher = await this.vouchersRepository.getVoucherByOwnerAndCorrelationId(
        metadata
      );

      if (voucher) {
        throw new Error(
          `VoucherSupply for User: ${res.locals.address} and CorrelationID: ${req.body._correlationId} already exits!`
        );
      }
    } catch (error) {
      console.error(error.message);
      return next(
        new ApiError(
          400,
          `VoucherSupply for User: ${res.locals.address} and CorrelationID: ${req.body._correlationId} already exits!`
        )
      );
    }

    next();
  }

  async validateVoucherStatus(req, res, next) {
    const status = Array.isArray(req.body)
      ? req.body[0].status
      : req.body.status; // support keeper's body (array)

    const validVoucherStatuses = Object.values(voucherStatuses); // extract as array

    if (!validVoucherStatuses.includes(status)) {
      return next(
        new ApiError(
          400,
          `UPDATE voucher operation could not be completed with invalid status: ${status}`
        )
      );
    }

    next();
  }
}

module.exports = VoucherValidationMiddleware;
