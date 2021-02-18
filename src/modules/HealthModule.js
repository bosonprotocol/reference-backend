const ErrorHandlingMiddleware = require("../api/middlewares/ErrorHandlingMiddleware");
const HealthController = require("../api/controllers/HealthController");

class HealthModule {
  constructor({ healthController } = {}) {
    this.healthController = healthController || new HealthController();
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
