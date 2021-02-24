const ErrorHandlingMiddleware = require("../api/middlewares/ErrorHandlingMiddleware");
const VouchersController = require("../api/controllers/VouchersController");
const UserValidationMiddleware = require("../api/middlewares/UserValidationMiddleware");
const EventValidationMiddleware = require("../api/middlewares/EventValidationMiddleware");

class VouchersModule {
  constructor({
    userAuthenticationMiddleware,
    userValidationMiddleware,
    eventValidationMiddleware,
    voucherSuppliesRepository,
    vouchersRepository,
    vouchersController,
  }) {
    this.userAuthenticationMiddleware = userAuthenticationMiddleware;
    this.userValidationMiddleware =
      userValidationMiddleware ||
      new UserValidationMiddleware(vouchersRepository);
    this.eventValidationMiddleware =
      eventValidationMiddleware || new EventValidationMiddleware();
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

    router.post(
      "/commit-to-buy/:supplyID",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.userAuthenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.userValidationMiddleware.validateMetadata(req, res, next)
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.vouchersController.commitToBuy(req, res, next)
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
        this.vouchersController.validateVoucherStatus(req, res, next)
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.vouchersController.updateVoucherStatus(req, res, next)
      )
    );

    router.patch(
      "/update-voucher-delivered",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.userAuthenticationMiddleware.authenticateGCLOUDService(
          req,
          res,
          next
        )
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.eventValidationMiddleware.validateUserVoucherMetadata(
          req,
          res,
          next
        )
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.vouchersController.validateVoucherStatus(req, res, next)
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.vouchersController.updateVoucherDelivered(req, res, next)
      )
    );

    router.patch(
      "/update-from-common-event",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.userAuthenticationMiddleware.authenticateGCLOUDService(
          req,
          res,
          next
        )
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.eventValidationMiddleware.validateUserVoucherMetadata(
          req,
          res,
          next
        )
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.vouchersController.validateVoucherStatus(req, res, next)
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.vouchersController.updateVoucherOnCommonEvent(req, res, next)
      )
    );

    router.patch(
      "/update-status-from-keepers",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.userAuthenticationMiddleware.authenticateGCLOUDService(
          req,
          res,
          next
        )
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.vouchersController.updateStatusFromKeepers(req, res, next)
      )
    );

    return router;
  }
}

module.exports = VouchersModule;
