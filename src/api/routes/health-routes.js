const ErrorHandlers = require("../middlewares/error-handler");

class HealthRoutes {
  constructor(healthController) {
    this.healthController = healthController;
  }

  addTo(router) {
    router.get(
      "/",
      ErrorHandlers.globalErrorHandler((req, res, next) =>
        this.healthController.getHealth(req, res, next)
      )
    );

    return router;
  }
}

module.exports = HealthRoutes;
