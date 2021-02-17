const ConfigurationService = require("../../services/configuration-service");
const AuthenticationService = require("../../services/authentication-service");

const ErrorHandlers = require("../middlewares/error-handler");
const UserValidator = require("../middlewares/user-validator");
const AuthenticationMiddleware = require("../middlewares/authentication");

const UsersController = require("../controllers/users-controller");

const configurationService = new ConfigurationService();

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
    this.authenticationMiddleware = new AuthenticationMiddleware(
      configurationService,
      authenticationService
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
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.authenticationMiddleware.authenticateToken(req, res, next)
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
