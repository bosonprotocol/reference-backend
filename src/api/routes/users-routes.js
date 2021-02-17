const ErrorHandlers = require("../middlewares/error-handler");

class UsersRoutes {
  constructor(
    userAuthenticationMiddleware,
    userValidationMiddleware,
    usersController
  ) {
    this.userAuthenticationMiddleware = userAuthenticationMiddleware;
    this.userValidationMiddleware = userValidationMiddleware;
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

    router.post(
      "/:supplyID/buy",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.userAuthenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.userValidationMiddleware.validateMetadata(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.usersController.commitToBuy(req, res, next)
      )
    );

    return router;
  }
}

module.exports = UsersRoutes;
