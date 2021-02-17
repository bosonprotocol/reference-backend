const ErrorHandlers = require("../middlewares/error-handler");

const eventValidator = require("../middlewares/event-validator");

class VoucherSuppliesModule {
  constructor(
    userAuthenticationMiddleware,
    fileStorageMiddleware,
    voucherValidationMiddleware,
    voucherSuppliesController
  ) {
    this.userAuthenticationMiddleware = userAuthenticationMiddleware;
    this.fileStorageMiddleware = fileStorageMiddleware;
    this.voucherValidationMiddleware = voucherValidationMiddleware;
    this.voucherSuppliesController = voucherSuppliesController;
  }

  mountPoint() {
    return "/voucher-sets";
  }

  addRoutesTo(router) {
    router.post(
      "/",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.userAuthenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.fileStorageMiddleware.storeFiles(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.voucherValidationMiddleware.validateDates(req, res, next)
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
        this.userAuthenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.voucherSuppliesController.getSupplyStatuses(req, res, next)
      )
    );

    router.get(
      "/status/active",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.userAuthenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.voucherSuppliesController.getActiveSupplies(req, res, next)
      )
    );

    router.get(
      "/status/inactive",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.userAuthenticationMiddleware.authenticateToken(req, res, next)
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

    //TODO Delete this route, once event listeners are merged to develop
    router.patch(
      "/update-supply-oncancel-intermediary",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.voucherSuppliesController.updateSupplyOnCancel(req, res, next)
      )
    );

    router.patch(
      "/set-supply-meta",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.authenticationMiddleware.authenticateGCLOUDService(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler(eventValidator.ValidateVoucherMetadata),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.voucherSuppliesController.setSupplyMetaOnOrderCreated(
          req,
          res,
          next
        )
      )
    );

    router.patch(
      "/update-supply-ontransfer",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.authenticationMiddleware.authenticateGCLOUDService(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler(
        eventValidator.ValidateVoucherMetadataOnTransfer
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.voucherSuppliesController.updateSupplyOnTransfer(req, res, next)
      )
    );

    router.patch(
      "/update-supply-oncancel",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.authenticationMiddleware.authenticateGCLOUDService(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler(eventValidator.ValidateVoucherMetadata),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.voucherSuppliesController.updateSupplyOnCancel(req, res, next)
      )
    );

    router.patch(
      "/:id",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.userAuthenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.fileStorageMiddleware.storeFiles(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.voucherValidationMiddleware.validateVoucherSupplyExists(
          req,
          res,
          next
        )
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.voucherValidationMiddleware.validateCanUpdateVoucherSupply(
          req,
          res,
          next
        )
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.voucherSuppliesController.updateVoucherSupply(req, res, next)
      )
    );

    router.delete(
      "/:id",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.userAuthenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.voucherValidationMiddleware.validateVoucherSupplyExists(
          req,
          res,
          next
        )
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.voucherValidationMiddleware.validateCanDelete(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.voucherSuppliesController.deleteVoucherSupply(req, res, next)
      )
    );

    router.delete(
      "/:id/image",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.userAuthenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.voucherValidationMiddleware.validateVoucherSupplyExists(
          req,
          res,
          next
        )
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.voucherValidationMiddleware.validateCanDelete(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.voucherSuppliesController.deleteImage(req, res, next)
      )
    );

    return router;
  }
}

module.exports = VoucherSuppliesModule;
