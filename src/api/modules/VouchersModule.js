const ErrorHandlers = require("../middlewares/error-handler");
const eventValidator = require("../middlewares/event-validator");

class VouchersModule {
  constructor(
    userAuthenticationMiddleware,
    userValidationMiddleware,
    vouchersController
  ) {
    this.userAuthenticationMiddleware = userAuthenticationMiddleware;
    this.userValidationMiddleware = userValidationMiddleware;
    this.vouchersController = vouchersController;
  }

  mountPoint() {
    return "/vouchers";
  }

  addRoutesTo(router) {
    router.get(
      "/",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.userAuthenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.vouchersController.getVouchers(req, res, next)
      )
    );

    router.post(
      "/commit-to-buy/:supplyID",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.userAuthenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.vouchersController.commitToBuy(req, res, next)
      )
    );

    router.get(
      "/:voucherID/voucher-details",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.userAuthenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.vouchersController.getVoucherDetails(req, res, next)
      )
    );

    router.get(
      "/buyers/:supplyID",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.userAuthenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.vouchersController.getBoughtVouchersForSupply(req, res, next)
      )
    );

    router.get(
      "/all",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.userAuthenticationMiddleware.authenticateGCLOUDService(
          req,
          res,
          next
        )
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
        this.userAuthenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.userValidationMiddleware.validateVoucherHolder(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.vouchersController.updateVoucherStatus(req, res, next)
      )
    );

    router.patch(
      "/update-voucher-delivered",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.authenticationMiddleware.authenticateGCLOUDService(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler(
        eventValidator.ValidateUserVoucherMetadata
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.vouchersController.updateVoucherDelivered(req, res, next)
      )
    );

    router.patch(
      "/update-from-common-event",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.authenticationMiddleware.authenticateGCLOUDService(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler(
        eventValidator.ValidateUserVoucherMetadata
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.vouchersController.updateVoucherOnCommonEvent(req, res, next)
      )
    );

    router.patch(
      "/update-status-from-keepers",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.userAuthenticationMiddleware.authenticateGCLOUDService(
          req,
          res,
          next
        )
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.vouchersController.updateStatusFromKeepers(req, res, next)
      )
    );

    return router;
  }
}

module.exports = VouchersModule;
