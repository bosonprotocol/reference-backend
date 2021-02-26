const basicAuthenticationMiddleware = require("express-basic-auth");

const ErrorHandlingMiddleware = require("../api/middlewares/ErrorHandlingMiddleware");
const AdministratorAuthenticationMiddleware = require("../api/middlewares/AdministratorAuthenticationMiddleware");
const AdministrationController = require("../api/controllers/AdministrationController");

class AdministrationModule {
  constructor({
    configurationService,
    authenticationService,
    usersRepository,
    voucherSuppliesRepository,
    administratorAuthenticationMiddleware,
    administrationController,
  }) {
    this.configurationService = configurationService;
    this.administratorAuthenticationMiddleware =
      administratorAuthenticationMiddleware ||
      new AdministratorAuthenticationMiddleware(
        authenticationService,
        usersRepository
      );
    this.administrationController =
      administrationController ||
      new AdministrationController(
        authenticationService,
        usersRepository,
        voucherSuppliesRepository
      );
  }

  mountPoint() {
    return "/admin";
  }

  addRoutesTo(router) {
    router.post(
      "/super/login",
      basicAuthenticationMiddleware({
        users: {
          [this.configurationService.superadminUsername]: this
            .configurationService.superadminPassword,
        },
      }),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.administrationController.logInSuperadmin(req, res, next)
      )
    );

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
