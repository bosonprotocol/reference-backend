const testController = require("../controllers/test-controller");
const ErrorHandlers = require("../middlewares/error-handler");

class TestRouter {
    static route(expressApp) {
        let router = expressApp.Router();

        router.post("/createBatch", ErrorHandlers.globalErrorHandler(testController.createVoucherSupply));

        router.post("/commitToBuy/:supplyID", ErrorHandlers.globalErrorHandler(testController.createVoucher));

        router.post("/redeem/:voucherID", ErrorHandlers.globalErrorHandler(testController.redeem));

        return router;
    }
}

module.exports = TestRouter;
