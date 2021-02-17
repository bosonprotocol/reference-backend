const ErrorHandlingMiddleware = require("../api/middlewares/ErrorHandlerMiddleware");

class HealthModule {
  constructor(healthController) {
    this.healthController = healthController;
  }

  mountPoint() {
    return "/health";
  }

  addRoutesTo(router) {
    router.get(
      "/",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.healthController.getHealth(req, res, next)
      )
    );

    return router;
  }
}

module.exports = HealthModule;
