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

        router.get('/sell/:address',
            ErrorHandlers.globalErrorHandler(vouchersController.getSellVouchers));
        
        router.get('/buy/:address',
            ErrorHandlers.globalErrorHandler(vouchersController.getBuyVouchers));

        router.patch('/:id',
            ErrorHandlers.globalErrorHandler(authenticationMiddleware.authenticateToken),
            ErrorHandlers.globalErrorHandler(upload.array('fileToUpload', FILE_LIMIT)),
            ErrorHandlers.globalErrorHandler(voucherValidator.ValidateVoucherExists),
            ErrorHandlers.globalErrorHandler(voucherValidator.ValidateCanDeleteVoucher),
            ErrorHandlers.globalErrorHandler(vouchersController.updateVoucher));
        
        router.delete('/:id',
            ErrorHandlers.globalErrorHandler(authenticationMiddleware.authenticateToken),
            ErrorHandlers.globalErrorHandler(voucherValidator.ValidateVoucherExists),
            ErrorHandlers.globalErrorHandler(voucherValidator.ValidateCanDeleteVoucher),
            ErrorHandlers.globalErrorHandler(vouchersController.deleteVoucher));

        router.delete(
            '/:id/image',
            ErrorHandlers.globalErrorHandler(authenticationMiddleware.authenticateToken),
            ErrorHandlers.globalErrorHandler(vouchersController.deleteImage));

        return router;
    }
}

module.exports = VouchersRouter;
