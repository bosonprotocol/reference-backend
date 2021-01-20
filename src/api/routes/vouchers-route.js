const vouchersController = require('../controllers/vouchers-controller');
const ErrorHandlers = require('../middlewares/error-handler');
const authenticationMiddleware = require('../middlewares/authentication');
const voucherValidator = require('../middlewares/voucher-validator')

const os = require('os');
const multer = require('multer');
const storage = multer.diskStorage({});
const FILE_LIMIT = 10;
const upload = multer({ storage });

class VouchersRouter {

    static route(expressApp) {
        let router = expressApp.Router();

        router.post('/',
            ErrorHandlers.globalErrorHandler(authenticationMiddleware.authenticateToken),
            ErrorHandlers.globalErrorHandler(upload.array('fileToUpload', FILE_LIMIT)),
            ErrorHandlers.globalErrorHandler(vouchersController.createVoucher));

        router.get('/:id',
            ErrorHandlers.globalErrorHandler(vouchersController.getVoucher));

        router.get('/seller-vouchers/status',
            ErrorHandlers.globalErrorHandler(authenticationMiddleware.authenticateToken),
            ErrorHandlers.globalErrorHandler(vouchersController.getVouchersStatus));

        router.get('/seller-vouchers/active',
            ErrorHandlers.globalErrorHandler(authenticationMiddleware.authenticateToken),
            ErrorHandlers.globalErrorHandler(vouchersController.getAllActiveVouchers));

        router.get('/seller-vouchers/inactive',
            ErrorHandlers.globalErrorHandler(authenticationMiddleware.authenticateToken),
            ErrorHandlers.globalErrorHandler(vouchersController.getAllInactiveVouchers));

        router.get('/sell/:address',
            ErrorHandlers.globalErrorHandler(vouchersController.getSellVouchers));
        
        router.get('/buy/:address',
            ErrorHandlers.globalErrorHandler(vouchersController.getBuyVouchers));

        router.patch('/updateVoucherFromEvent',
        // ErrorHandlers.globalErrorHandler(authenticationMiddleware.authenticateToken), // TODO GCLOUD AUTH
        // might think for some validation of existence
        ErrorHandlers.globalErrorHandler(vouchersController.updateVoucherFromEvent));
        
        router.patch('/:id',
            ErrorHandlers.globalErrorHandler(authenticationMiddleware.authenticateToken),
            ErrorHandlers.globalErrorHandler(upload.array('fileToUpload', FILE_LIMIT)),
            ErrorHandlers.globalErrorHandler(voucherValidator.ValidateVoucherExists),
            ErrorHandlers.globalErrorHandler(voucherValidator.ValidateCanUpdateVoucher),
            ErrorHandlers.globalErrorHandler(vouchersController.updateVoucher));
        
        router.delete('/:id',
            ErrorHandlers.globalErrorHandler(authenticationMiddleware.authenticateToken),
            ErrorHandlers.globalErrorHandler(voucherValidator.ValidateVoucherExists),
            ErrorHandlers.globalErrorHandler(voucherValidator.ValidateCanDelete),
            ErrorHandlers.globalErrorHandler(vouchersController.deleteVoucher));

        router.delete(
            '/:id/image',
            ErrorHandlers.globalErrorHandler(authenticationMiddleware.authenticateToken),
            ErrorHandlers.globalErrorHandler(voucherValidator.ValidateVoucherExists),
            ErrorHandlers.globalErrorHandler(voucherValidator.ValidateCanDelete),
            ErrorHandlers.globalErrorHandler(vouchersController.deleteImage));

        return router;
    }
}

module.exports = VouchersRouter;
