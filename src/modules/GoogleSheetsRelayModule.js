const ErrorHandlingMiddleware = require("../api/middlewares/ErrorHandlingMiddleware");
const GoogleSheetsRelayController = require("../api/controllers/GoogleSheetsRelayController");

class GoogleSheetsRelayModule {
  constructor({ configurationService }) {
    this.configurationService = configurationService;
    this.googleSheetsRelayController = new GoogleSheetsRelayController();
  }

  mountPoint() {
    return "/sheets";
  }

  addRoutesTo(router) {
    router.get(
      "/whitelist",
      ErrorHandlingMiddleware.globalErrorHandler(
        async (req, res, next) =>
          await this.googleSheetsRelayController.getSellerWhitelist(
            req,
            res,
            next
          )
      )
    );

    router.get(
      "/product-listings/drafts",
      ErrorHandlingMiddleware.globalErrorHandler(
        async (req, res, next) =>
          await this.googleSheetsRelayController.getDraftListings(
            req,
            res,
            next
          )
      )
    );

    return router;
  }
}

module.exports = GoogleSheetsRelayModule;
