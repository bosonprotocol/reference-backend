const ErrorHandlingMiddleware = require("../middlewares/ErrorHandlingMiddleware");

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

    router.post(
      "/:supplyID/buy",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.userAuthenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.userValidationMiddleware.validateMetadata(req, res, next)
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.usersController.commitToBuy(req, res, next)
      )
    );

    return router;
  }
}

module.exports = UsersModule;
