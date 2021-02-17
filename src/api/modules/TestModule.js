const ErrorHandlers = require("../middlewares/error-handler");

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
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.testController.createVoucherSupply(req, res, next)
      )
    );

    router.post(
      "/commitToBuy/:supplyID",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.testController.createVoucher(req, res, next)
      )
    );

    router.post(
      "/redeem/:voucherID",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.testController.redeem(req, res, next)
      )
    );

    return router;
  }
}

module.exports = TestModule;
