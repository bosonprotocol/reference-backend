const AdminController = require('../controllers/admin-controller');
const ErrorHandlers = require('../middlewares/error-handler');
const AdminAuth = require('../middlewares/admin-auth');

class UserVoucherController {

    static route(expressApp) {
        let router = expressApp.Router();

        router.patch('/:address',
            ErrorHandlers.globalErrorHandler(AdminAuth.validateAdminAccess),
            ErrorHandlers.globalErrorHandler(AdminController.makeAdmin));

        router.patch('/updateVisibleStatus/:voucherID',
            ErrorHandlers.globalErrorHandler(AdminAuth.validateAdminAccess),
            ErrorHandlers.globalErrorHandler(AdminController.changeTokenSupplyIDVisibility));

        return router;
    }
}

module.exports = UserVoucherController;
