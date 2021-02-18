const ErrorHandlingMiddleware = require("../api/middlewares/ErrorHandlingMiddleware");
const VoucherSuppliesController = require("../api/controllers/VoucherSuppliesController");
const FileStorageMiddleware = require("../api/middlewares/FileStorageMiddleware");
const VoucherValidationMiddleware = require("../api/middlewares/VoucherValidationMiddleware");

class VoucherSuppliesModule {
  constructor({
    configurationService,
    userAuthenticationMiddleware,
    voucherImageStorageMiddleware,
    voucherValidationMiddleware,
    voucherSuppliesRepository,
    voucherSuppliesController,
  }) {
    this.userAuthenticationMiddleware = userAuthenticationMiddleware;
    this.voucherImageStorageMiddleware =
      voucherImageStorageMiddleware ||
      new FileStorageMiddleware(
        "fileToUpload",
        configurationService.vouchersBucket
      );
    this.voucherValidationMiddleware =
      voucherValidationMiddleware ||
      new VoucherValidationMiddleware(voucherSuppliesRepository);
    this.voucherSuppliesController =
      voucherSuppliesController ||
      new VoucherSuppliesController(voucherSuppliesRepository);
  }

  mountPoint() {
    return "/voucher-sets";
  }

  addRoutesTo(router) {
    router.post(
      "/",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.userAuthenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.voucherImageStorageMiddleware.storeFiles(req, res, next)
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.voucherValidationMiddleware.validateDates(req, res, next)
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.voucherSuppliesController.createVoucherSupply(req, res, next)
      )
    );

    router.get(
      "/:id",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.voucherSuppliesController.getVoucherSupply(req, res, next)
      )
    );

    router.get(
      "/",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.voucherSuppliesController.getAllVoucherSupplies(req, res, next)
      )
    );

    router.get(
      "/status/all",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.userAuthenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.voucherSuppliesController.getSupplyStatuses(req, res, next)
      )
    );

    router.get(
      "/status/active",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.userAuthenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.voucherSuppliesController.getActiveSupplies(req, res, next)
      )
    );

    router.get(
      "/status/inactive",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.userAuthenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.voucherSuppliesController.getInactiveSupplies(req, res, next)
      )
    );

    router.get(
      "/sell/:address",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.voucherSuppliesController.getSellerSupplies(req, res, next)
      )
    );

    router.get(
      "/buy/:address",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.voucherSuppliesController.getBuyerSupplies(req, res, next)
      )
    );

    router.patch(
      "/:id",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.userAuthenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.voucherImageStorageMiddleware.storeFiles(req, res, next)
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.voucherValidationMiddleware.validateVoucherSupplyExists(
          req,
          res,
          next
        )
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.voucherValidationMiddleware.validateCanUpdateVoucherSupply(
          req,
          res,
          next
        )
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.voucherSuppliesController.updateVoucherSupply(req, res, next)
      )
    );

    router.delete(
      "/:id",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.userAuthenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.voucherValidationMiddleware.validateVoucherSupplyExists(
          req,
          res,
          next
        )
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.voucherValidationMiddleware.validateCanDelete(req, res, next)
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.voucherSuppliesController.deleteVoucherSupply(req, res, next)
      )
    );

    router.delete(
      "/:id/image",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.userAuthenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.voucherValidationMiddleware.validateVoucherSupplyExists(
          req,
          res,
          next
        )
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.voucherValidationMiddleware.validateCanDelete(req, res, next)
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.voucherSuppliesController.deleteImage(req, res, next)
      )
    );

    return router;
  }
}

module.exports = VoucherSuppliesModule;
