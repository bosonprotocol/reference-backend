const ErrorHandlingMiddleware = require("../api/middlewares/ErrorHandlingMiddleware");
const EventsController = require("../api/controllers/EventsController");
const EventValidationMiddleware = require("../api/middlewares/EventValidationMiddleware");

class EventsModule {
  constructor({
    userAuthenticationMiddleware,
    eventValidationMiddleware,
    eventsRepository,
    eventsController,
  }) {
    this.userAuthenticationMiddleware = userAuthenticationMiddleware;
    this.eventValidationMiddleware =
      eventValidationMiddleware ||
      new EventValidationMiddleware(eventsRepository);
    this.eventsController =
      eventsController || new EventsController(eventsRepository);
  }

  mountPoint() {
    return "/events";
  }

  //TODO Should getters be accessed by admins only?
  addRoutesTo(router) {
    router.post(
      "/create",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.userAuthenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.eventsController.create(req, res, next)
      )
    );

    router.patch(
      "/update-by-correlation-id",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.userAuthenticationMiddleware.authenticateGCLOUDService(
          req,
          res,
          next
        )
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.eventValidationMiddleware.validateEventExistsByCorrelationId(
          req,
          res,
          next
        )
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.eventsController.updateByCorrelationId(req, res, next)
      )
    );

    router.patch(
      "/update-by-token-id",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.userAuthenticationMiddleware.authenticateGCLOUDService(
          req,
          res,
          next
        )
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.eventValidationMiddleware.validateEventExistsByTokenId(
          req,
          res,
          next
        )
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.eventsController.updateByTokenId(req, res, next)
      )
    );

    router.get(
      "/all",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.eventsController.getAll(req, res, next)
      )
    );

    router.get(
      "/detected",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.eventsController.getDetected(req, res, next)
      )
    );

    router.get(
      "/failed",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.eventsController.getFailed(req, res, next)
      )
    );

    return router;
  }
}

module.exports = EventsModule;
