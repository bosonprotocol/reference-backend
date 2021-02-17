const ErrorHandlers = require("../middlewares/error-handler");
const voucherValidator = require("../middlewares/voucher-validator");
const FileStorageMiddleware = require("../middlewares/file-storage");

const voucherSuppliesController = require("../controllers/voucher-supplies-controller");

class VoucherSuppliesRoutes {
  constructor(authenticationMiddleware) {
    this.authenticationMiddleware = authenticationMiddleware;
    this.fileStorageMiddleware = new FileStorageMiddleware("fileToUpload");
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

    router.patch(
      "/:id",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.authenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler(
        upload.array("fileToUpload", FILE_LIMIT)
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
