const userVoucherController = require('../controllers/user-vouchers-controller');
const ErrorHandlers = require('../middlewares/error-handler');
const voucherValidator = require('../middlewares/voucher-validator')
const authenticationMiddleware = require('../middlewares/authentication');

class UserVoucherController {

    static route(expressApp) {
        let router = expressApp.Router();

        router.post('/commitToBuy/:voucherID',
            ErrorHandlers.globalErrorHandler(authenticationMiddleware.authenticateToken),
            //TODO this might need to be removed as we are no longer receiving _holder on this request
            // ErrorHandlers.globalErrorHandler(voucherValidator.ValidateMetadata),
            ErrorHandlers.globalErrorHandler(userVoucherController.commitToBuy));

        // TODO GCLOUD AUTH
        router.patch('/voucher-delivered',
            // ErrorHandlers.globalErrorHandler(authenticationMiddleware.authenticateToken),
            ErrorHandlers.globalErrorHandler(userVoucherController.updateVoucherDelivered))

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

        router.patch('/update',
            ErrorHandlers.globalErrorHandler(authenticationMiddleware.authenticateToken),
            ErrorHandlers.globalErrorHandler(voucherValidator.ValidateVoucherHolder),
            ErrorHandlers.globalErrorHandler(userVoucherController.updateMyVoucher));

        router.patch('/finalize',
            ErrorHandlers.globalErrorHandler(authenticationMiddleware.authenticateGCLOUDService),
            ErrorHandlers.globalErrorHandler(userVoucherController.finalizeVoucher));

        return router;
    }
}

module.exports = UserVoucherController;
