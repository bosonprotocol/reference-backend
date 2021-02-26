const ErrorHandlingMiddleware = require("../api/middlewares/ErrorHandlingMiddleware");
const UsersController = require("../api/controllers/UsersController");

class UsersModule {
  constructor({ authenticationService, usersRepository, usersController }) {
    this.usersController =
      usersController ||
      new UsersController(authenticationService, usersRepository);
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
