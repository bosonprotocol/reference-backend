const paymentsController = require("../controllers/payment-controller");
const ErrorHandlers = require("../middlewares/error-handler");
const authenticationMiddleware = require("../middlewares/authentication");
const paymentValidator = require("../middlewares/payment-validator");

class UserVoucherController {
  static route(expressApp) {
    let router = expressApp.Router();
    router.get(
      "/get-payment/:tokenIdVoucher",
      ErrorHandlers.globalErrorHandler(
        paymentsController.getPaymentsByVoucherID
      )
    );

    router.get(
      "/:voucherID",
      ErrorHandlers.globalErrorHandler(paymentValidator.ValidateID),
      ErrorHandlers.globalErrorHandler(paymentsController.getPaymentActors)
    );

    router.post(
      "/create-payment",
      ErrorHandlers.globalErrorHandler(
        authenticationMiddleware.authenticateGCLOUDService
      ),
      ErrorHandlers.globalErrorHandler(paymentValidator.ValidatePaymentData),
      ErrorHandlers.globalErrorHandler(paymentsController.createPayments)
    );

    return router;
  }
}

module.exports = UserVoucherController;