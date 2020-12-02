const testController = require('../controllers/test-controller');
const ErrorHandlers = require('../middlewares/error-handler');

class TestRouter {

    static route(expressApp) {
        let router = expressApp.Router();

        router.post('/createBatch',
            ErrorHandlers.globalErrorHandler(testController.createVoucher));
    
        return router;
    }
}

module.exports = TestRouter;