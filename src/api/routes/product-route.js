const productController = require('../controllers/product-controller');
const ErrorHandlers = require('../middlewares/error-handler');


/**
 * In a certain router class we could have as many routes as we want for the specific scenario
 */
class ProductRouter {

    /**
     * Attaches new Methods Route to /methods
     * @param expressApp
     * @returns {router}
     */
    static route (expressApp) {
        let router = expressApp.Router();

        /**
         * Example of get request to the server path `/`
         */
        router.get('/', ErrorHandlers.globalErrorHandler(productController.emptyRouter));

        /**
         * Example of post request to the server path `/example`
         */
        router.post('/products', ErrorHandlers.globalErrorHandler(productController.postProduct));
        router.get('/products', ErrorHandlers.globalErrorHandler(productController.getProducts));

        /**
        * Example of get request to the server followed by an ID specified outside by parameter `/example/:id`
        */
        router.get('/products/:id', ErrorHandlers.globalErrorHandler(productController.exampleRouterParam));

        return router;
    }
}

module.exports = ProductRouter;
