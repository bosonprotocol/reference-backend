const ErrorHandlers = require("../middlewares/error-handler");

class VouchersRoutes {
  constructor(
    authenticationMiddleware,
    userValidatorMiddleware,
    vouchersController
  ) {
    this.authenticationMiddleware = authenticationMiddleware;
    this.userValidatorMiddleware = userValidatorMiddleware;
    this.vouchersController = vouchersController;
  }

  addTo(router) {
    router.get(
      "/",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.authenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.vouchersController.getVouchers(req, res, next)
      )
    );

    router.get(
      "/:voucherID/voucher-details",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.authenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.vouchersController.getVoucherDetails(req, res, next)
      )
    );

    router.get(
      "/buyers/:supplyID",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.authenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.vouchersController.getBoughtVouchersForSupply(req, res, next)
      )
    );

    router.get(
      "/all",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.authenticationMiddleware.authenticateGCLOUDService(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.vouchersController.getAllVouchers(req, res, next)
      )
    );

    router.get(
      "/public",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.vouchersController.getAllVouchers(req, res, next)
      )
    );

    router.patch(
      "/update",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.authenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.userValidatorMiddleware.validateVoucherHolder(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.vouchersController.updateVoucher(req, res, next)
      )
    );

    router.patch(
      "/finalize",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.authenticationMiddleware.authenticateGCLOUDService(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.vouchersController.finalizeVoucher(req, res, next)
      )
    );

    return router;
  }
}

module.exports = VouchersRoutes;
