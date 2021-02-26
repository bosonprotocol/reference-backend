const ErrorHandlingMiddleware = require("../api/middlewares/ErrorHandlingMiddleware");
const PaymentsController = require("../api/controllers/PaymentsController");
const PaymentValidationMiddleware = require("../api/middlewares/PaymentValidationMiddleware");

class PaymentsModule {
  constructor({
    vouchersRepository,
    paymentsRepository,
    userAuthenticationMiddleware,
    paymentValidationMiddleware,
    paymentsController,
  }) {
    this.userAuthenticationMiddleware = userAuthenticationMiddleware;
    this.paymentValidationMiddleware =
      paymentValidationMiddleware || new PaymentValidationMiddleware();
    this.paymentsController =
      paymentsController ||
      new PaymentsController(vouchersRepository, paymentsRepository);
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
        this.userAuthenticationMiddleware.authenticateGCLOUDService(
          req,
          res,
          next
        )
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
