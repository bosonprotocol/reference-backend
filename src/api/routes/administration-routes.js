const ErrorHandlers = require("../middlewares/error-handler");

class AdministrationRoutes {
  constructor(administratorAuthenticationMiddleware, administrationController) {
    this.administratorAuthenticationMiddleware = administratorAuthenticationMiddleware;
    this.administrationController = administrationController;
  }

  addTo(router) {
    router.patch(
      "/:address",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.administratorAuthenticationMiddleware.validateAdminAccess(
          req,
          res,
          next
        )
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.administrationController.makeAdmin(req, res, next)
      )
    );

    router.patch(
      "/updateVisibleStatus/:supplyID",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.administratorAuthenticationMiddleware.validateAdminAccess(
          req,
          res,
          next
        )
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
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

module.exports = AdministrationRoutes;
