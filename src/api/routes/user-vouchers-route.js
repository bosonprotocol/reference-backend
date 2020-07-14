const userVoucherController = require('../controllers/user-vouchers-controller');
const ErrorHandlers = require('../middlewares/error-handler');
const authenticationMiddleware = require('../middlewares/authentication');

class UserVoucherController {

    static route(expressApp) {
        let router = expressApp.Router();

        router.get('/:address',
            ErrorHandlers.globalErrorHandler(userVoucherController.getMyVouchers));

        router.get('/:voucherID/voucher-details',
            ErrorHandlers.globalErrorHandler(userVoucherController.getVoucherDetails));

        router.patch('/update',
            ErrorHandlers.globalErrorHandler(userVoucherController.updateMyVoucher));

        return router;
    }
}

module.exports = UserVoucherController;
