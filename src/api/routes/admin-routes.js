const AdminController = require("../controllers/admin-controller");
const ErrorHandlers = require("../middlewares/error-handler");
const AdminAuth = require("../middlewares/admin-auth");

class UserVoucherRoutes {
  addTo(router) {
    router.patch(
      "/:address",
      ErrorHandlers.globalErrorHandler(AdminAuth.validateAdminAccess),
      ErrorHandlers.globalErrorHandler(AdminController.makeAdmin)
    );

    router.patch(
      "/updateVisibleStatus/:supplyID",
      ErrorHandlers.globalErrorHandler(AdminAuth.validateAdminAccess),
      ErrorHandlers.globalErrorHandler(
        AdminController.changeVoucherSupplyVisibility
      )
    );

    return router;
  }
}

module.exports = UserVoucherRoutes;
