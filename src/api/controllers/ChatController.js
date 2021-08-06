const { WebClient } = require("@slack/web-api");
const ApiError = require("../ApiError");

class ChatController {
  constructor(config) {
    this.web = new WebClient(config.slackToken);
    this.channel = config.channelId;
    this.chatMetaData = new Map();
    this.buyersRepository = config.buyersChatRepository;
  }

  async relayMessageToSlack(req, res, next) {
    // Post the message to the slack channel
    try {
      let thread_ts = "";

      const existingMetaData = await this.buyersRepository.getThread([req.body.voucherId, req.body.address].join(","));
      console.log(existingMetaData + 'HERE DATA relayMessageToSlack 18')

      if (existingMetaData) {
        thread_ts = existingMetaData.thread_ts;
      }

      console.log(req.body.message);
      console.log(this.channel);

      const result = await this.web.chat.postMessage({
        text: req.body.message,
        channel: this.channel,
        username: req.body.address,
        thread_ts: thread_ts,
      });

      console.log('result channel: ' + result.channel);
      console.log('result channel: ' + +result.ts);

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
    const existingMetaData = await this.buyersRepository.getThread([data.key.voucherId, data.key.address].join(","));

    if (!existingMetaData) {
      const newT = await this.buyersRepository.createThread({
        chatId: [data.key.voucherId, data.key.address].join(","),
        thread_ts: data.metadata.thread_ts,
        channel: data.metadata.channel
      });
      console.log(newT + ' **WRITTEN THREAD**');
    }

    next();
  }

  async getSlackThread(req, res, next) {
    const existingMetaData = await this.buyersRepository.getThread([req.params.voucherId, req.params.address].join(","));
    
    console.log(existingMetaData + ' **META DATA**');

    if (!existingMetaData) {
      req.body.output = null;
    } else {
      try {
        const result = await this.web.conversations.replies({
          channel: existingMetaData.channel,
          ts: existingMetaData.thread_ts,
        });
        
        console.log('**MESSAGE FROM THREAD**')
        console.log(result.messages);
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
