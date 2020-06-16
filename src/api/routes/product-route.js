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

        router.post('/products', ErrorHandlers.globalErrorHandler(productController.postProduct));
        router.get('/products', ErrorHandlers.globalErrorHandler(productController.getProducts));


        return router;
    }
}

module.exports = ProductRouter;
