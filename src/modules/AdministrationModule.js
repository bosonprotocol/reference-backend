const ErrorHandlingMiddleware = require("../api/middlewares/ErrorHandlingMiddleware");

class AdministrationModule {
  constructor(administratorAuthenticationMiddleware, administrationController) {
    this.administratorAuthenticationMiddleware = administratorAuthenticationMiddleware;
    this.administrationController = administrationController;
  }

  mountPoint() {
    return "/admin";
  }

  addRoutesTo(router) {
    router.patch(
      "/:address",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.administratorAuthenticationMiddleware.validateAdminAccess(
          req,
          res,
          next
        )
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.administrationController.makeAdmin(req, res, next)
      )
    );

    router.patch(
      "/updateVisibleStatus/:supplyID",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.administratorAuthenticationMiddleware.validateAdminAccess(
          req,
          res,
          next
        )
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.administrationController.changeVoucherSupplyVisibility(
          req,
          res,
          next
        )
      )
    );

    return router;
  }
}

module.exports = AdministrationModule;
