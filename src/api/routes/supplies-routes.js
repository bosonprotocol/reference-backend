const ErrorHandlers = require("../middlewares/error-handler");

class VoucherSuppliesRoutes {
  constructor(
    authenticationMiddleware,
    fileStorageMiddleware,
    voucherSuppliesController,
    voucherValidator
  ) {
    this.authenticationMiddleware = authenticationMiddleware;
    this.fileStorageMiddleware = fileStorageMiddleware;
    this.voucherSuppliesController = voucherSuppliesController;
    this.voucherValidator = voucherValidator;
  }

  addTo(router) {
    router.post(
      "/",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.authenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.fileStorageMiddleware.storeFiles(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.voucherValidator.validateDates(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.voucherSuppliesController.createVoucherSupply(req, res, next)
      )
    );

    router.get(
      "/:id",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.voucherSuppliesController.getVoucherSupply(req, res, next)
      )
    );

    router.get(
      "/",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.voucherSuppliesController.getAllVoucherSupplies(req, res, next)
      )
    );

    router.get(
      "/status/all",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.authenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.voucherSuppliesController.getSupplyStatuses(req, res, next)
      )
    );

    router.get(
      "/status/active",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.authenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.voucherSuppliesController.getActiveSupplies(req, res, next)
      )
    );

    router.get(
      "/status/inactive",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.authenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.voucherSuppliesController.getInactiveSupplies(req, res, next)
      )
    );

    router.get(
      "/sell/:address",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.voucherSuppliesController.getSellerSupplies(req, res, next)
      )
    );

    router.get(
      "/buy/:address",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.voucherSuppliesController.getBuyerSupplies(req, res, next)
      )
    );

    router.patch(
      "/:id",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.authenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.fileStorageMiddleware.storeFiles(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.voucherValidator.validateVoucherSupplyExists(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.voucherValidator.validateCanUpdateVoucherSupply(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.voucherSuppliesController.updateVoucherSupply(req, res, next)
      )
    );

    router.delete(
      "/:id",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.authenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.voucherValidator.validateVoucherSupplyExists(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.voucherValidator.validateCanDelete(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.voucherSuppliesController.deleteVoucherSupply(req, res, next)
      )
    );

    router.delete(
      "/:id/image",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.authenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.voucherValidator.validateVoucherSupplyExists(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.voucherValidator.validateCanDelete(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.voucherSuppliesController.deleteImage(req, res, next)
      )
    );

    return router;
  }
}

module.exports = VoucherSuppliesRoutes;
