const ErrorHandlers = require("../middlewares/error-handler");

class PaymentsRoutes {
  constructor(
    authenticationMiddleware,
    paymentValidatorMiddleware,
    paymentsController
  ) {
    this.authenticationMiddleware = authenticationMiddleware;
    this.paymentValidatorMiddleware = paymentValidatorMiddleware;
    this.paymentsController = paymentsController;
  }

  addTo(router) {
    router.get(
      "/get-payment/:tokenIdVoucher",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.paymentsController.getPaymentsByVoucherID(req, res, next)
      )
    );

    router.get(
      "/:voucherID",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.paymentValidatorMiddleware.validateID(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.paymentsController.getPaymentActors(req, res, next)
      )
    );

    router.post(
      "/create-payment",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.authenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.paymentValidatorMiddleware.validatePaymentData(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.paymentsController.createPayments(req, res, next)
      )
    );

    return router;
  }
}

module.exports = PaymentsRoutes;
