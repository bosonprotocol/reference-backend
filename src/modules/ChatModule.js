const ErrorHandlingMiddleware = require("../api/middlewares/ErrorHandlingMiddleware");
const ChatController = require("../api/controllers/ChatController");

class ChatModule {
  constructor({ configurationService }) {
    this.configurationService = configurationService;
    this.chatController = new ChatController({
      slackToken: configurationService.slackToken,
      channelId: configurationService.slackChannel,
    });
  }

  mountPoint() {
    return "/chat";
  }

  addRoutesTo(router) {
    router.post(
      "/:voucherId/send",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.chatController.relayMessageToSlack(req, res, next)
      ),
      ErrorHandlingMiddleware.globalErrorHandler(
        (req, res, next) =>
          this.chatController.storeChatMetaDataIfNew(req, res, next) // keep track of "ts" to be used for "thread_ts" in replies
      )
    );

    router.get(
      "/:voucherId/:address",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.chatController.getSlackThread(req, res, next)
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res) =>
        this.chatController.formatMessages(req, res)
      )
    );

    return router;
  }
}

module.exports = ChatModule;
