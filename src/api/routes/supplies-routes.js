const voucherSuppliesController = require("../controllers/voucher-supplies-controller");
const ErrorHandlers = require("../middlewares/error-handler");
const authenticationMiddleware = require("../middlewares/authentication");
const voucherValidator = require("../middlewares/voucher-validator"); // todo to be renamed to supply validator
const eventValidator = require("../middlewares/event-validator");

const multer = require("multer");
const storage = multer.diskStorage({});
const FILE_LIMIT = 10;
const upload = multer({ storage });

class VoucherSuppliesRoutes {
  addTo(router) {
    router.post(
      "/",
      ErrorHandlers.globalErrorHandler(
        authenticationMiddleware.authenticateToken
      ),
      ErrorHandlers.globalErrorHandler(
        upload.array("fileToUpload", FILE_LIMIT)
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
      ErrorHandlers.globalErrorHandler(
        authenticationMiddleware.authenticateToken
      ),
      ErrorHandlers.globalErrorHandler(
        voucherSuppliesController.getSupplyStatuses
      )
    );

    router.get(
      "/status/active",
      ErrorHandlers.globalErrorHandler(
        authenticationMiddleware.authenticateToken
      ),
      ErrorHandlers.globalErrorHandler(
        voucherSuppliesController.getActiveSupplies
      )
    );

    router.get(
      "/status/inactive",
      ErrorHandlers.globalErrorHandler(
        authenticationMiddleware.authenticateToken
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
      ErrorHandlers.globalErrorHandler(
        authenticationMiddleware.authenticateGCLOUDService
      ),
      ErrorHandlers.globalErrorHandler(eventValidator.ValidateVoucherMetadata),
      ErrorHandlers.globalErrorHandler(
        voucherSuppliesController.setSupplyMetaOnOrderCreated
      )
    );

    router.patch(
      "/update-supply-ontransfer",
      ErrorHandlers.globalErrorHandler(
        authenticationMiddleware.authenticateGCLOUDService
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
      ErrorHandlers.globalErrorHandler(
        authenticationMiddleware.authenticateGCLOUDService
      ),
      ErrorHandlers.globalErrorHandler(eventValidator.ValidateVoucherMetadata),
      ErrorHandlers.globalErrorHandler(
        voucherSuppliesController.updateSupplyOnCancel
      )
    );

    router.patch(
      "/:id",
      ErrorHandlers.globalErrorHandler(
        authenticationMiddleware.authenticateToken
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
      ErrorHandlers.globalErrorHandler(
        authenticationMiddleware.authenticateToken
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
      ErrorHandlers.globalErrorHandler(
        authenticationMiddleware.authenticateToken
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
