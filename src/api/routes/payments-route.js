const paymentsController = require('../controllers/payment-controller');
const ErrorHandlers = require('../middlewares/error-handler');
const authenticationMiddleware = require('../middlewares/authentication');

class UserVoucherController {

    static route(expressApp) {
        let router = expressApp.Router();

        router.get('/:voucherID',
            ErrorHandlers.globalErrorHandler(authenticationMiddleware.authenticateToken), 
            ErrorHandlers.globalErrorHandler(paymentsController.getPaymentActors));

        router.post('/create-payment',
            ErrorHandlers.globalErrorHandler(authenticationMiddleware.authenticateGCLOUDService),
            ErrorHandlers.globalErrorHandler(paymentsController.createPayments));


        return router;
    }
}

module.exports = UserVoucherController;