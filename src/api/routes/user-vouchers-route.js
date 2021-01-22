const userVoucherController = require('../controllers/user-vouchers-controller');
const ErrorHandlers = require('../middlewares/error-handler');
const eventValidator = require('../middlewares/event-validator')
const authenticationMiddleware = require('../middlewares/authentication');

class UserVoucherController {

    static route(expressApp) {
        let router = expressApp.Router();

        router.post('/commitToBuy/:voucherID',
            ErrorHandlers.globalErrorHandler(authenticationMiddleware.authenticateToken),
            ErrorHandlers.globalErrorHandler(userVoucherController.commitToBuy));

        router.patch('/update-voucher-delivered',
            ErrorHandlers.globalErrorHandler(authenticationMiddleware.authenticateGCLOUDService),
            ErrorHandlers.globalErrorHandler(eventValidator.ValidateUserVoucherMetadata),
            ErrorHandlers.globalErrorHandler(userVoucherController.updateVoucherDelivered))

        router.patch('/update-from-common-event',
            ErrorHandlers.globalErrorHandler(authenticationMiddleware.authenticateGCLOUDService),
            ErrorHandlers.globalErrorHandler(eventValidator.ValidateUserVoucherMetadata),
            ErrorHandlers.globalErrorHandler(userVoucherController.updateMyVoucherOnCommonEvent));

        router.patch('/finalize',
            ErrorHandlers.globalErrorHandler(authenticationMiddleware.authenticateGCLOUDService),
            ErrorHandlers.globalErrorHandler(userVoucherController.finalizeVoucher));

        router.get('/',
            ErrorHandlers.globalErrorHandler(authenticationMiddleware.authenticateToken),
            ErrorHandlers.globalErrorHandler(userVoucherController.getMyVouchers));

        router.get('/:voucherID/voucher-details',
            ErrorHandlers.globalErrorHandler(authenticationMiddleware.authenticateToken),
            ErrorHandlers.globalErrorHandler(userVoucherController.getVoucherDetails));

        router.get('/buyers/:voucherID',
            ErrorHandlers.globalErrorHandler(authenticationMiddleware.authenticateToken),
            ErrorHandlers.globalErrorHandler(userVoucherController.getBuyersByVoucherID));

        router.get('/all',
            ErrorHandlers.globalErrorHandler(authenticationMiddleware.authenticateGCLOUDService),
            ErrorHandlers.globalErrorHandler(userVoucherController.getAllVouchers));



        return router;
    }
}

module.exports = UserVoucherController;
