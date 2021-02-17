const ErrorHandlingMiddleware = require("../api/middlewares/ErrorHandlingMiddleware");

class PaymentsModule {
  constructor(
    userAuthenticationMiddleware,
    paymentValidationMiddleware,
    paymentsController
  ) {
    this.userAuthenticationMiddleware = userAuthenticationMiddleware;
    this.paymentValidationMiddleware = paymentValidationMiddleware;
    this.paymentsController = paymentsController;
  }

  mountPoint() {
    return "/payments";
  }

  addRoutesTo(router) {
    router.get(
      "/get-payment/:tokenIdVoucher",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.paymentsController.getPaymentsByVoucherID(req, res, next)
      )
    );

    router.get(
      "/:voucherID",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.paymentValidationMiddleware.validateID(req, res, next)
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.paymentsController.getPaymentActors(req, res, next)
      )
    );

    router.post(
      "/create-payment",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.userAuthenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.paymentValidationMiddleware.validatePaymentData(req, res, next)
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.paymentsController.createPayments(req, res, next)
      )
    );

    return router;
  }
}

module.exports = PaymentsModule;
