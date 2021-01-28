const userVoucherController = require("../controllers/vouchers-controller");
const ErrorHandlers = require("../middlewares/error-handler");
const userValidator = require("../middlewares/user-validator");
const authenticationMiddleware = require("../middlewares/authentication");

class VouchersController {
  static route(expressApp) {
    let router = expressApp.Router();

    router.get(
      "/",
      ErrorHandlers.globalErrorHandler(
        authenticationMiddleware.authenticateToken
      ),
      ErrorHandlers.globalErrorHandler(userVoucherController.getVouchers)
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
      ErrorHandlers.globalErrorHandler(userVoucherController.updateVoucher)
    );

    router.patch(
      "/finalize",
      ErrorHandlers.globalErrorHandler(
        authenticationMiddleware.authenticateGCLOUDService
      ),
      ErrorHandlers.globalErrorHandler(userVoucherController.finalizeVoucher)
    );

    return router;
  }
}

module.exports = VouchersController;
