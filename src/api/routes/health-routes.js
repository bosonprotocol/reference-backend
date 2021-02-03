const healthController = require("../controllers/health-controller");
const ErrorHandlers = require("../middlewares/error-handler");

class HealthRoutes {
  addTo(router) {
    router.get(
      "/",
      ErrorHandlers.globalErrorHandler(healthController.getHealth)
    );

    return router;
  }
}

module.exports = HealthRoutes;
