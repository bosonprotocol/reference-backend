const ErrorHandlers = require("../middlewares/error-handler");

class UsersModule {
  constructor(
    userAuthenticationMiddleware,
    userValidationMiddleware,
    usersController
  ) {
    this.userAuthenticationMiddleware = userAuthenticationMiddleware;
    this.userValidationMiddleware = userValidationMiddleware;
    this.usersController = usersController;
  }

  mountPoint() {
    return "/users";
  }

  addRoutesTo(router) {
    router.post(
      "/:address",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.usersController.generateNonce(req, res, next)
      )
    );

    router.post(
      "/:address/verify-signature",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.usersController.verifySignature(req, res, next)
      )
    );

    return router;
  }
}

module.exports = UsersModule;
