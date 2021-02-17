const ErrorHandlers = require("../middlewares/error-handler");

// TODO: Rename to supply validator
const voucherValidator = require("../middlewares/voucher-validator");
const eventValidator = require("../middlewares/event-validator");

const voucherSuppliesController = require("../controllers/voucher-supplies-controller");

class VoucherSuppliesRoutes {
  constructor(authenticationMiddleware, fileStorageMiddleware) {
    this.authenticationMiddleware = authenticationMiddleware;
    this.fileStorageMiddleware = fileStorageMiddleware;
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
      ErrorHandlers.globalErrorHandler(voucherValidator.ValidateDates),
      ErrorHandlers.globalErrorHandler(
        voucherSuppliesController.createVoucherSupply
      )
    );

    router.get(
      "/:id",
      ErrorHandlers.globalErrorHandler(
        voucherSuppliesController.getVoucherSupply
      )
    );

    router.get(
      "/",
      ErrorHandlers.globalErrorHandler(
        voucherSuppliesController.getAllVoucherSupplies
      )
    );

    router.get(
      "/status/all",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.authenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler(
        voucherSuppliesController.getSupplyStatuses
      )
    );

    router.get(
      "/status/active",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.authenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler(
        voucherSuppliesController.getActiveSupplies
      )
    );

    router.get(
      "/status/inactive",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.authenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler(
        voucherSuppliesController.getInactiveSupplies
      )
    );

    router.get(
      "/sell/:address",
      ErrorHandlers.globalErrorHandler(
        voucherSuppliesController.getSellerSupplies
      )
    );

    router.get(
      "/buy/:address",
      ErrorHandlers.globalErrorHandler(
        voucherSuppliesController.getBuyerSupplies
      )
    );

    //TODO Delete this route, once event listeners are merged to develop
    router.patch(
      "/update-supply-oncancel-intermediary",
      ErrorHandlers.globalErrorHandler(
        voucherSuppliesController.updateSupplyOnCancel
      )
    );

    router.patch(
      "/set-supply-meta",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.authenticationMiddleware.authenticateGCLOUDService(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler(eventValidator.ValidateVoucherMetadata),
      ErrorHandlers.globalErrorHandler(
        voucherSuppliesController.setSupplyMetaOnOrderCreated
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
      ErrorHandlers.globalErrorHandler(
        voucherSuppliesController.updateSupplyOnTransfer
      )
    );

    router.patch(
      "/update-supply-oncancel",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.authenticationMiddleware.authenticateGCLOUDService(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler(eventValidator.ValidateVoucherMetadata),
      ErrorHandlers.globalErrorHandler(
        voucherSuppliesController.updateSupplyOnCancel
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
      ErrorHandlers.globalErrorHandler(
        voucherValidator.ValidateVoucherSupplyExists
      ),
      ErrorHandlers.globalErrorHandler(
        voucherValidator.ValidateCanUpdateVoucherSupply
      ),
      ErrorHandlers.globalErrorHandler(
        voucherSuppliesController.updateVoucherSupply
      )
    );

    router.delete(
      "/:id",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.authenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler(
        voucherValidator.ValidateVoucherSupplyExists
      ),
      ErrorHandlers.globalErrorHandler(voucherValidator.ValidateCanDelete),
      ErrorHandlers.globalErrorHandler(
        voucherSuppliesController.deleteVoucherSupply
      )
    );

    router.delete(
      "/:id/image",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.authenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler(
        voucherValidator.ValidateVoucherSupplyExists
      ),
      ErrorHandlers.globalErrorHandler(voucherValidator.ValidateCanDelete),
      ErrorHandlers.globalErrorHandler(voucherSuppliesController.deleteImage)
    );

    return router;
  }
}

module.exports = VoucherSuppliesRoutes;
