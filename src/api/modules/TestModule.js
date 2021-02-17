const ErrorHandlingMiddleware = require("../middlewares/ErrorHandlingMiddleware");

class TestModule {
  constructor(testController) {
    this.testController = testController;
  }

  mountPoint() {
    return "/test";
  }

  addRoutesTo(router) {
    router.post(
      "/createBatch",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.testController.createVoucherSupply(req, res, next)
      )
    );

    router.post(
      "/commitToBuy/:supplyID",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.testController.createVoucher(req, res, next)
      )
    );

    router.post(
      "/redeem/:voucherID",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.testController.redeem(req, res, next)
      )
    );

    return router;
  }
}

module.exports = TestModule;
