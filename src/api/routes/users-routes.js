const ErrorHandlers = require("../middlewares/error-handler");

class UsersRoutes {
  constructor(
    authenticationMiddleware,
    userValidatorMiddleware,
    usersController
  ) {
    this.authenticationMiddleware = authenticationMiddleware;
    this.userValidatorMiddleware = userValidatorMiddleware;
    this.usersController = usersController;
  }

  addTo(router) {
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

module.exports = UsersRoutes;
