const ErrorHandlingMiddleware = require("../api/middlewares/ErrorHandlingMiddleware");
const VouchersController = require("../api/controllers/VouchersController");
const UserValidationMiddleware = require("../api/middlewares/UserValidationMiddleware");

class VouchersModule {
  constructor({
    userAuthenticationMiddleware,
    userValidationMiddleware,
    voucherSuppliesRepository,
    vouchersRepository,
    vouchersController,
  }) {
    this.userAuthenticationMiddleware = userAuthenticationMiddleware;
    this.userValidationMiddleware =
      userValidationMiddleware ||
      new UserValidationMiddleware(vouchersRepository);
    this.vouchersController =
      vouchersController ||
      new VouchersController(voucherSuppliesRepository, vouchersRepository);
  }

  mountPoint() {
    return "/vouchers";
  }

  addRoutesTo(router) {
    router.get(
      "/",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.userAuthenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.vouchersController.getVouchers(req, res, next)
      )
    );

    router.get(
      "/:voucherID/voucher-details",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.userAuthenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.vouchersController.getVoucherDetails(req, res, next)
      )
    );

    router.get(
      "/buyers/:supplyID",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.userAuthenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.vouchersController.getBoughtVouchersForSupply(req, res, next)
      )
    );

    router.get(
      "/all",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.userAuthenticationMiddleware.authenticateGCLOUDService(
          req,
          res,
          next
        )
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.vouchersController.getAllVouchers(req, res, next)
      )
    );

    router.get(
      "/public",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.vouchersController.getAllVouchers(req, res, next)
      )
    );

    router.patch(
      "/update",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.userAuthenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.userValidationMiddleware.validateVoucherHolder(req, res, next)
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.vouchersController.updateVoucher(req, res, next)
      )
    );

    router.patch(
      "/finalize",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.userAuthenticationMiddleware.authenticateGCLOUDService(
          req,
          res,
          next
        )
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.vouchersController.finalizeVoucher(req, res, next)
      )
    );

    return router;
  }
}

module.exports = VouchersModule;