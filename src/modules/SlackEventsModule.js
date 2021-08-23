const ErrorHandlingMiddleware = require("../api/middlewares/ErrorHandlingMiddleware");
const SlackEventsController = require("../api/controllers/SlackEventsController");

class SlackEventsModule {
    constructor() {
        this.slackEventsController = new SlackEventsController();
    }

    mountPoint() {
        return "/slack";
    }

    addRoutesTo(router) {
        router.post(
            "/events",
            ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
                this.slackEventsController.messageEventListenerSlack(req, res, next)
            )
        );
        return router;
    }
}

module.exports = SlackEventsModule;