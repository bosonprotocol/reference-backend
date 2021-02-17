const ErrorHandlers = require("../middlewares/error-handler");

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
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.healthController.getHealth(req, res, next)
      )
    );

    return router;
  }
}

module.exports = HealthModule;
