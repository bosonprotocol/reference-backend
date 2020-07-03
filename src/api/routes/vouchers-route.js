const vouchersController = require('../controllers/vouchers-controller');
const ErrorHandlers = require('../middlewares/error-handler');
const authenticationMiddleware = require('../middlewares/authentication');
const voucherValidator = require('../middlewares/voucher-validator')

const os = require('os');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, os.tmpdir())
    }
});
const FILE_LIMIT = 10;
const upload = multer({ storage });

class VouchersRouter {

    static route(expressApp) {
        let router = expressApp.Router();

        router.post('/',
            // TODO Uncomment authentication
            // ErrorHandlers.globalErrorHandler(authenticationMiddleware.authenticateToken),
            ErrorHandlers.globalErrorHandler(upload.array('fileToUpload', FILE_LIMIT)),
            ErrorHandlers.globalErrorHandler(vouchersController.createVoucher));

        router.get('/:id',
            // TODO Uncomment authentication
            // ErrorHandlers.globalErrorHandler(authenticationMiddleware.authenticateToken),
            ErrorHandlers.globalErrorHandler(vouchersController.getVoucher));

        router.patch('/:id',
            // TODO Uncomment authentication
            // ErrorHandlers.globalErrorHandler(authenticationMiddleware.authenticateToken),
            ErrorHandlers.globalErrorHandler(upload.array('fileToUpload', FILE_LIMIT)),
            ErrorHandlers.globalErrorHandler(voucherValidator.ValidateVoucherExists),
            ErrorHandlers.globalErrorHandler(voucherValidator.ValidateCanDeleteVoucher),
            ErrorHandlers.globalErrorHandler(vouchersController.updateVoucher));
        
        router.delete('/:id',
            // TODO Uncomment authentication
            // ErrorHandlers.globalErrorHandler(authenticationMiddleware.authenticateToken),
            ErrorHandlers.globalErrorHandler(voucherValidator.ValidateVoucherExists),
            ErrorHandlers.globalErrorHandler(voucherValidator.ValidateCanDeleteVoucher),
            ErrorHandlers.globalErrorHandler(vouchersController.deleteVoucher));

        return router;
    }
}

module.exports = VouchersRouter;
