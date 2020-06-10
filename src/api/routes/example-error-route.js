const exampleErrorController = require('../controllers/example-error-controller');
const ErrorHandlers = require('../middlewares/error-handler');

/**
 * Example Router which should call different type of erros produced by the controller
 */
class ExampleRouter {

    static route(expressApp) {
        let router = expressApp.Router();

        /**
         * throws an error by the API
         */
        router.get('/apierror', ErrorHandlers.globalErrorHandler(exampleErrorController.apiError));

        /**
        * simulates unexpected error thrown outside of the API
        */
        router.get('/globalerror', ErrorHandlers.globalErrorHandler(exampleErrorController.globalError));

        return router;
    }
}

module.exports = ExampleRouter;
