const userVoucherController = require('../controllers/vouchers-controller');
const ErrorHandlers = require('../middlewares/error-handler');
const userValidator = require('../middlewares/user-validator')
const authenticationMiddleware = require('../middlewares/authentication');
const eventValidator = require('../middlewares/event-validator')


class VouchersController {

    static route(expressApp) {
        let router = expressApp.Router();

        router.post('/commit-to-buy/:supplyID',
            ErrorHandlers.globalErrorHandler(authenticationMiddleware.authenticateToken),
            ErrorHandlers.globalErrorHandler(userVoucherController.commitToBuy));

        router.get('/',
            ErrorHandlers.globalErrorHandler(authenticationMiddleware.authenticateToken),
            ErrorHandlers.globalErrorHandler(userVoucherController.getVouchers));

        router.get('/:voucherID/voucher-details',
            ErrorHandlers.globalErrorHandler(authenticationMiddleware.authenticateToken),
            ErrorHandlers.globalErrorHandler(userVoucherController.getVoucherDetails));

        router.get('/buyers/:supplyID',
            ErrorHandlers.globalErrorHandler(authenticationMiddleware.authenticateToken),
            ErrorHandlers.globalErrorHandler(userVoucherController.getBoughtVouchersForSupply));

        router.get('/all',
            ErrorHandlers.globalErrorHandler(authenticationMiddleware.authenticateGCLOUDService),
            ErrorHandlers.globalErrorHandler(userVoucherController.getAllVouchers));

        router.get('/public',
            ErrorHandlers.globalErrorHandler(userVoucherController.getAllVouchers));

        router.patch('/update-voucher-delivered',
            ErrorHandlers.globalErrorHandler(authenticationMiddleware.authenticateGCLOUDService),
            ErrorHandlers.globalErrorHandler(eventValidator.ValidateUserVoucherMetadata),
            ErrorHandlers.globalErrorHandler(userVoucherController.updateVoucherDelivered))

        router.patch('/update-from-common-event',
            ErrorHandlers.globalErrorHandler(authenticationMiddleware.authenticateGCLOUDService),
            ErrorHandlers.globalErrorHandler(eventValidator.ValidateUserVoucherMetadata),
            ErrorHandlers.globalErrorHandler(userVoucherController.updateVoucherOnCommonEvent));


        router.patch('/finalize',
            ErrorHandlers.globalErrorHandler(authenticationMiddleware.authenticateGCLOUDService),
            ErrorHandlers.globalErrorHandler(userVoucherController.finalizeVoucher));

        return router;
    }
}

module.exports = VouchersController;
