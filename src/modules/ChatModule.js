const ErrorHandlingMiddleware = require("../api/middlewares/ErrorHandlingMiddleware");
const ChatController = require("../api/controllers/ChatController");
const ChatRepository = require("../database/Chat/ChatRepository");

class ChatModule {
  constructor({ configurationService }) {
    this.configurationService = configurationService;
    this.chatController = new ChatController({
      slackToken: configurationService.slackToken,
      channelId: configurationService.slackChannel,
      chatRepository: new ChatRepository(),
    });
  }

  mountPoint() {
    return "/chat";
  }

  addRoutesTo(router) {
    router.get(
      "/:voucherId/:address",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.chatController.openWS(req, res, next)
      )
    );

    return router;
  }
}

module.exports = ChatModule;
