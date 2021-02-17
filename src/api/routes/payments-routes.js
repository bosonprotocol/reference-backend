const ConfigurationService = require("../../services/configuration-service");
const AuthenticationService = require("../../services/authentication-service");

const paymentValidator = require("../middlewares/payment-validator");
const ErrorHandlers = require("../middlewares/error-handler");
const AuthenticationMiddleware = require("../middlewares/authentication");

const paymentsController = require("../controllers/payment-controller");

const configurationService = new ConfigurationService();
const authenticationService = new AuthenticationService(configurationService);

const authenticationMiddleware = new AuthenticationMiddleware(
  configurationService,
  authenticationService
);

class UserVoucherRoutes {
  addTo(router) {
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
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        authenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler(paymentValidator.ValidatePaymentData),
      ErrorHandlers.globalErrorHandler(paymentsController.createPayments)
    );

    return router;
  }
}

module.exports = UserVoucherRoutes;
