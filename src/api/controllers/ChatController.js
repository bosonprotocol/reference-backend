const { WebClient } = require("@slack/web-api");
const ApiError = require("../ApiError");

class ChatController {
  constructor(config) {
    this.web = new WebClient(config.slackToken);
    this.channel = config.channelId;
    this.chatRepository = config.chatRepository;
  }

  async relayMessageToSlack(req, res, next) {
    // Post the message to the slack channel
    try {
      const existingMetaData = await this.chatRepository.getThread(
        [req.body.voucherId, req.body.address].join(",")
      );
      const thread_ts = existingMetaData ? existingMetaData.thread_ts : "";

      const result = await this.web.chat.postMessage({
        text: req.body.message,
        channel: this.channel,
        username: req.body.address,
        thread_ts: thread_ts,
        icon_emoji: ":information_desk_person:",
      });

      req.body.output = {
        key: {
          voucherId: req.body.voucherId,
          address: req.body.address,
        },
        metadata: {
          channel: result.channel,
          thread_ts: result.ts,
        },
      }; // attach data to request to pass on
    } catch (e) {
      console.log(e);
      return next(new ApiError(502, "Bad Gateway."));
    }

    next();
  }

  async storeChatMetaDataIfNew(req, res) {
    // store ts & channel in a map where key is voucherId & address
    const data = req.body.output;
    const existingMetaData = await this.chatRepository.getThread(
      [data.key.voucherId, data.key.address].join(",")
    );

    if (!existingMetaData) {
      await this.chatRepository.createThread({
        chatId: [data.key.voucherId, data.key.address].join(","),
        thread_ts: data.metadata.thread_ts,
        channel: data.metadata.channel,
      });
    }

    res.json(true);
  }

  async getSlackThread(req, res, next) {
    const existingMetaData = await this.chatRepository.getThread(
      [req.params.voucherId, req.params.address].join(",")
    );

    if (existingMetaData) {
      try {
        const result = await this.web.conversations.replies({
          channel: existingMetaData.channel,
          ts: existingMetaData.thread_ts,
        });

        req.body.output = result.messages;
      } catch (e) {
        console.log(e);
        return next(new ApiError(502, "Bad Gateway."));
      }
    }

    next();
  }

  async formatMessages(req, res) {
    let messages = [];

    if (req.body.output) {
      for (let message of req.body.output) {
        const data = {
          type: message.username ? "BUYER" : "SELLER", // bot has "username" while actual users have "user" property
          account: req.params.address,
          timestamp: new Date(parseInt(message.ts) * 1000),
          message: message.text,
        };
        messages.push(data);
      }
    }

    return res.json(messages);
  }
}

module.exports = ChatController;
