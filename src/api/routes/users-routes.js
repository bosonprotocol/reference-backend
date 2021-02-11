const UsersController = require("../controllers/users-controller");
const ErrorHandlers = require("../middlewares/error-handler");
const UserValidator = require("../middlewares/user-validator");
const authenticationMiddleware = require("../middlewares/authentication");

class UsersRoutes {
  constructor(
    authenticationService,
    usersRepository,
    voucherSuppliesRepository,
    vouchersRepository
  ) {
    this.usersController = new UsersController(
      authenticationService,
      usersRepository,
      voucherSuppliesRepository,
      vouchersRepository
    );
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
      ErrorHandlers.globalErrorHandler(
        authenticationMiddleware.authenticateToken
      ),
      ErrorHandlers.globalErrorHandler(UserValidator.ValidateMetadata),
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.usersController.commitToBuy(req, res, next)
      )
    );

    return router;
  }
}

module.exports = UsersRoutes;
