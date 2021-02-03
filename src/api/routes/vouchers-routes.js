const userVoucherController = require("../controllers/vouchers-controller");
const ErrorHandlers = require("../middlewares/error-handler");
const authenticationMiddleware = require("../middlewares/authentication");
const eventValidator = require("../middlewares/event-validator");
const userValidator = require("../middlewares/user-validator"); //todo to be renamed to voucher validator

class VouchersRoutes {
  addTo(router) {
    router.get(
      "/",
      ErrorHandlers.globalErrorHandler(
        authenticationMiddleware.authenticateToken
      ),
      ErrorHandlers.globalErrorHandler(userVoucherController.getVouchers)
    );

    router.post(
      "/commit-to-buy/:supplyID",
      ErrorHandlers.globalErrorHandler(
        authenticationMiddleware.authenticateToken
      ),
      ErrorHandlers.globalErrorHandler(userVoucherController.commitToBuy)
    );

    router.get(
      "/:voucherID/voucher-details",
      ErrorHandlers.globalErrorHandler(
        authenticationMiddleware.authenticateToken
      ),
      ErrorHandlers.globalErrorHandler(userVoucherController.getVoucherDetails)
    );

    router.get(
      "/buyers/:supplyID",
      ErrorHandlers.globalErrorHandler(
        authenticationMiddleware.authenticateToken
      ),
      ErrorHandlers.globalErrorHandler(
        userVoucherController.getBoughtVouchersForSupply
      )
    );

    router.get(
      "/all",
      ErrorHandlers.globalErrorHandler(
        authenticationMiddleware.authenticateGCLOUDService
      ),
      ErrorHandlers.globalErrorHandler(userVoucherController.getAllVouchers)
    );

    router.get(
      "/public",
      ErrorHandlers.globalErrorHandler(userVoucherController.getAllVouchers)
    );

    router.patch(
      "/update",
      ErrorHandlers.globalErrorHandler(
        authenticationMiddleware.authenticateToken
      ),
      ErrorHandlers.globalErrorHandler(userValidator.ValidateVoucherHolder),
      ErrorHandlers.globalErrorHandler(
        userVoucherController.updateVoucherStatus
      )
    );

    router.patch(
      "/update-voucher-delivered",
      ErrorHandlers.globalErrorHandler(
        authenticationMiddleware.authenticateGCLOUDService
      ),
      ErrorHandlers.globalErrorHandler(
        eventValidator.ValidateUserVoucherMetadata
      ),
      ErrorHandlers.globalErrorHandler(
        userVoucherController.updateVoucherDelivered
      )
    );

    router.patch(
      "/update-from-common-event",
      ErrorHandlers.globalErrorHandler(
        authenticationMiddleware.authenticateGCLOUDService
      ),
      ErrorHandlers.globalErrorHandler(
        eventValidator.ValidateUserVoucherMetadata
      ),
      ErrorHandlers.globalErrorHandler(
        userVoucherController.updateVoucherOnCommonEvent
      )
    );

    router.patch(
      "/update-status-from-keepers",
      ErrorHandlers.globalErrorHandler(
        authenticationMiddleware.authenticateGCLOUDService
      ),
      ErrorHandlers.globalErrorHandler(
        userVoucherController.updateStatusFromKeepers
      )
    );

    return router;
  }
}

module.exports = VouchersRoutes;
