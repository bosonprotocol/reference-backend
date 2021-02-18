const ErrorHandlingMiddleware = require("../api/middlewares/ErrorHandlingMiddleware");
const UsersController = require("../api/controllers/UsersController");
const UserValidationMiddleware = require("../api/middlewares/UserValidationMiddleware");

class UsersModule {
  constructor({
    authenticationService,
    usersRepository,
    voucherSuppliesRepository,
    vouchersRepository,
    userAuthenticationMiddleware,
    userValidationMiddleware,
    usersController,
  }) {
    this.userAuthenticationMiddleware = userAuthenticationMiddleware;
    this.userValidationMiddleware =
      userValidationMiddleware ||
      new UserValidationMiddleware(vouchersRepository);
    this.usersController =
      usersController ||
      new UsersController(
        authenticationService,
        usersRepository,
        voucherSuppliesRepository,
        vouchersRepository
      );
  }

  mountPoint() {
    return "/users";
  }

  addRoutesTo(router) {
    router.post(
      "/:address",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.usersController.generateNonce(req, res, next)
      )
    );

    router.post(
      "/:address/verify-signature",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.usersController.verifySignature(req, res, next)
      )
    );

    return router;
  }
}

module.exports = UsersModule;
