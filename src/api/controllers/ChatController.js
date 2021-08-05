const { WebClient } = require("@slack/web-api");
const ApiError = require("../ApiError");

class ChatController {
  constructor(config) {
    this.web = new WebClient(config.slackToken);
    this.channel = config.channelId;
    this.chatMetaData = new Map();
  }

  async relayMessageToSlack(req, res, next) {
    // Post the message to the slack channel
    try {
      let thread_ts = "";
      const existingMetaData = this.chatMetaData.get(
        [req.body.voucherId, req.body.address].join(",")
      );
      if (existingMetaData) {
        thread_ts = existingMetaData.thread_ts;
      }

      const result = await this.web.chat.postMessage({
        text: req.body.message,
        channel: this.channel,
        username: req.body.address,
        thread_ts: thread_ts,
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

  async storeChatMetaDataIfNew(req, res, next) {
    // store ts & channel in a map where key is voucherId & address
    const data = req.body.output;

    const existingMetaData = this.chatMetaData.get(
      [data.key.voucherId, data.key.address].join(",")
    );

    if (!existingMetaData) {
      this.chatMetaData.set(
        [data.key.voucherId, data.key.address].join(","),
        data.metadata
      );
    }

    next();
  }

  async getSlackThread(req, res, next) {
    const existingMetaData = this.chatMetaData.get(
      [req.params.voucherId, req.params.address].join(",")
    );
    if (!existingMetaData) {
      req.body.output = null;
    } else {
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
    if (!req.body.output) {
      return res.json([]); // return empty messages array
    }

    let messages = [];

    for (let message of req.body.output) {
      const data = {
        type: message.username ? "BUYER" : "SELLER", // bot has "username" while actual users have "user" property
        account: req.params.address,
        timestamp: new Date(parseInt(message.ts) * 1000), // format to datatime
        message: message.text,
      };
      messages.push(data);
    }

    return res.json(messages);
  }
}

module.exports = ChatController;
