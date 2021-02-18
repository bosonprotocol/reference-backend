const ErrorHandlingMiddleware = require("../api/middlewares/ErrorHandlingMiddleware");
const AdministratorAuthenticationMiddleware = require("../api/middlewares/AdministratorAuthenticationMiddleware");
const AdministrationController = require("../api/controllers/AdministrationController");

class AdministrationModule {
  constructor({
    authenticationService,
    usersRepository,
    voucherSuppliesRepository,
    administratorAuthenticationMiddleware,
    administrationController,
  }) {
    this.administratorAuthenticationMiddleware =
      administratorAuthenticationMiddleware ||
      new AdministratorAuthenticationMiddleware(
        authenticationService,
        usersRepository
      );
    this.administrationController =
      administrationController ||
      new AdministrationController(usersRepository, voucherSuppliesRepository);
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