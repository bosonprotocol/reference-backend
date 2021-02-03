const healthController = require("../controllers/health-controller");
const ErrorHandlers = require("../middlewares/error-handler");

class HealthRouter {
  static route(expressApp) {
    let router = expressApp.Router();

    router.get(
      "/",
      ErrorHandlers.globalErrorHandler(healthController.getHealth)
    );

    return router;
  }
}

module.exports = HealthRouter;
