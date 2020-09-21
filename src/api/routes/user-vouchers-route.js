const userVoucherController = require('../controllers/user-vouchers-controller');
const ErrorHandlers = require('../middlewares/error-handler');
const userValidator = require('../middlewares/user-validator')
const authenticationMiddleware = require('../middlewares/authentication');

class UserVoucherController {

    static route(expressApp) {
        let router = expressApp.Router();

        router.get('/',
            ErrorHandlers.globalErrorHandler(authenticationMiddleware.authenticateToken),
            ErrorHandlers.globalErrorHandler(userVoucherController.getMyVouchers));

        router.get('/:voucherID/voucher-details',
            ErrorHandlers.globalErrorHandler(authenticationMiddleware.authenticateToken),
            ErrorHandlers.globalErrorHandler(userVoucherController.getVoucherDetails));

        router.get('/buyers/:voucherID',
            ErrorHandlers.globalErrorHandler(authenticationMiddleware.authenticateToken),
            ErrorHandlers.globalErrorHandler(userVoucherController.getBuyersByVoucherID));

        router.patch('/update',
            ErrorHandlers.globalErrorHandler(authenticationMiddleware.authenticateToken),
            ErrorHandlers.globalErrorHandler(userValidator.ValidateVoucherHolder),
            ErrorHandlers.globalErrorHandler(userVoucherController.updateMyVoucher));

        router.patch('/finalize',
            ErrorHandlers.globalErrorHandler(authenticationMiddleware.authenticateGCLOUDService),
            ErrorHandlers.globalErrorHandler(userVoucherController.finalizeVoucher));

        return router;
    }
}

module.exports = UserVoucherController;
