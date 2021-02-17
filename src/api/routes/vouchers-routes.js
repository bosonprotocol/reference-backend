const ConfigurationService = require("../../services/configuration-service");
const AuthenticationService = require("../../services/authentication-service");

const ErrorHandlers = require("../middlewares/error-handler");
const eventValidator = require("../middlewares/event-validator");
const userValidator = require("../middlewares/user-validator"); //todo to be renamed to voucher validator
const AuthenticationMiddleware = require("../middlewares/authentication");

const userVoucherController = require("../controllers/vouchers-controller");

const configurationService = new ConfigurationService();
const authenticationService = new AuthenticationService(configurationService);

const authenticationMiddleware = new AuthenticationMiddleware(
  configurationService,
  authenticationService
);

class VouchersRoutes {
  addTo(router) {
    router.get(
      "/",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        authenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler(userVoucherController.getVouchers)
    );

    router.post(
      "/commit-to-buy/:supplyID",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.authenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler(userVoucherController.commitToBuy)
    );

    router.get(
      "/:voucherID/voucher-details",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        authenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler(userVoucherController.getVoucherDetails)
    );

    router.get(
      "/buyers/:supplyID",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        authenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler(
        userVoucherController.getBoughtVouchersForSupply
      )
    );

    router.get(
      "/all",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        authenticationMiddleware.authenticateGCLOUDService(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler(userVoucherController.getAllVouchers)
    );

    router.get(
      "/public",
      ErrorHandlers.globalErrorHandler(userVoucherController.getAllVouchers)
    );

    router.patch(
      "/update",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        authenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler(userValidator.ValidateVoucherHolder),
      ErrorHandlers.globalErrorHandler(
        userVoucherController.updateVoucherStatus
      )
    );

    router.patch(
      "/update-voucher-delivered",
      ErrorHandlers.globalErrorHandler(
        authenticationMiddleware.authenticateGCLOUDService
      ),
      ErrorHandlers.globalErrorHandler(
        eventValidator.ValidateUserVoucherMetadata
      ),
      ErrorHandlers.globalErrorHandler(
        userVoucherController.updateVoucherDelivered
      )
    );

    router.patch(
      "/update-from-common-event",
      ErrorHandlers.globalErrorHandler(
        authenticationMiddleware.authenticateGCLOUDService
      ),
      ErrorHandlers.globalErrorHandler(
        eventValidator.ValidateUserVoucherMetadata
      ),
      ErrorHandlers.globalErrorHandler(
        userVoucherController.updateVoucherOnCommonEvent
      )
    );

    router.patch(
      "/update-status-from-keepers",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        authenticationMiddleware.authenticateGCLOUDService(req, res, next)
      ),
      ErrorHandlers.globalErrorHandler(
        userVoucherController.updateStatusFromKeepers
      )
    );

    return router;
  }
}

module.exports = VouchersRoutes;
