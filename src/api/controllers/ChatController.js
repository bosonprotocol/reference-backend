const { WebClient } = require("@slack/web-api");
const e = require("cors");
const ApiError = require("../ApiError");

class ChatController {
  constructor(config) {
    this.web = new WebClient(config.slackToken);
    this.channel = config.channelId;
    this.chatRepository = config.chatRepository;
    this.NEW_CHAT_MESSAGE_EVENT = "message";
    this.io;
    this.createWebSocketService();
  }
  // In future it could be attached to the port of the main server
  createWebSocketService() {
    const webSocketPORT = 4000;
    const server = require("http").createServer();
    this.io = require("socket.io")(server, {
      cors: {
        origin: "*",
      },
    });
    server.listen(webSocketPORT, () => {
      console.log(`Listening on port ${webSocketPORT}`);
    });
  }

  async relayMessageOperations(existingMetaData, data) {
    const relayMessageToSlackData = await this.relayMessageToSlack(data);
    await this.storeChatMetaDataIfNew(relayMessageToSlackData);
    const messagesData = await this.getSlackThread(existingMetaData.channel, existingMetaData.thread_ts);
    const msg = this.formatMessages(messagesData.messages);
    this.io.in(existingMetaData.thread_ts).emit(this.NEW_CHAT_MESSAGE_EVENT, msg);
  }

  async openWS(req, res) {
    const voucherIdRequest = req.params.voucherId;
    const addressRequest = req.params.address;
    const roomIdRequest = [voucherIdRequest, addressRequest].join(",");
    const existingMetaDataRequest = await this.chatRepository.getThread(roomIdRequest);
    const connections = [] 
    this.io.on("connection", async (socket) => {
      console.log('CONNECT')
      
      this.io.removeAllListeners();
      const { roomId, address, voucherId, message } = socket.handshake.query;
      // Get thread from Slack API
      const existingMetaData = await this.chatRepository.getThread(roomId);

      if (existingMetaData !== null) {

        connections.push(existingMetaData.thread_ts)
        console.log(connections.length)
        
        // Join a room
        console.log('thread_ts: ' + existingMetaData.thread_ts)
        socket.join(existingMetaData.thread_ts);
        // Get messages from thread
        const messagesData = { ...await this.getSlackThread(existingMetaData.channel, existingMetaData.thread_ts), address };
        // Extract and render messages
        const messages = this.formatMessages(messagesData.messages);
        // Emit all messages after successful connection
        this.io.in(existingMetaData.thread_ts).emit(this.NEW_CHAT_MESSAGE_EVENT, messages);
        // Listen for new messages
        socket.on(this.NEW_CHAT_MESSAGE_EVENT, async (data) => {
          // Emit newest message
          this.relayMessageOperations(existingMetaData, data);
        });
        // Leave the room if the user closes the socket
        socket.on("disconnect", () => {
          socket.leave(existingMetaData.thread_ts);
          console.log('DISCONNECT 1')
        });

      } else {
        // If we don't have existing metadata (we haven't posted any message till that moment)
        // and we have a message attached to our query in WS params 
        if (message) {

          console.log('MESSAGE');

          const requestData = {
            address, voucherId, message
          };
          const initialMessageResponse = await this.relayMessageToSlack(requestData);

          await this.storeChatMetaDataIfNew(initialMessageResponse);

          const existingMetaData = await this.chatRepository.getThread(roomId);

          socket.join(existingMetaData.thread_ts);

          const messagesData = { ...await this.getSlackThread(existingMetaData.channel, existingMetaData.thread_ts), address };

          const messages = this.formatMessages(messagesData.messages);

          this.io.in(existingMetaData.thread_ts).emit(this.NEW_CHAT_MESSAGE_EVENT, messages);

          socket.on(this.NEW_CHAT_MESSAGE_EVENT, async (data) => {
            // Emit newest message
            this.relayMessageOperations(existingMetaData, data);
          });

          // Leave the room if the user closes the socket
          socket.on("disconnect", () => {
            socket.leave(existingMetaData.thread_ts);
            console.log('DISCONNECT 2')
          });
        }

      }
    });

    if (!existingMetaDataRequest) {
      res.status(200).send({ metadataExists: false });
    } else {
      res.status(200).send({ metadataExists: true });
    }

  }

  async relayMessageToSlack(data) {
    // Post the message to the slack channel
    try {
      const existingMetaData = await this.chatRepository.getThread(
        [data.voucherId, data.address].join(",")
      );
      const thread_ts = existingMetaData ? existingMetaData.thread_ts : "";

      const result = await this.web.chat.postMessage({
        text: data.message,
        channel: this.channel,
        username: data.address,
        thread_ts: thread_ts,
        icon_emoji: ":information_desk_person:",
      });

      // Return data
      return {
        key: {
          voucherId: data.voucherId,
          address: data.address,
        },
        metadata: {
          channel: result.channel,
          thread_ts: result.ts,
        }
      };

    } catch (e) {
      console.log(e);
    }
  }

  async storeChatMetaDataIfNew(data) {
    const existingMetaData = await this.chatRepository.getThread([data.key.voucherId, data.key.address].join(","));

    if (!existingMetaData) {
      console.log(data.metadata)
      await this.chatRepository.createThread({
        chatId: [data.key.voucherId, data.key.address].join(","),
        thread_ts: data.metadata.thread_ts,
        channel: data.metadata.channel,
      });
    }
  }

  async getSlackThread(channel, thread) {
    if (channel && thread) {
      try {
        const result = await this.web.conversations.replies({
          channel,
          ts: thread
        });
        return result;

      } catch (e) {
        console.log(e);
        // return next(new ApiError(502, "Bad Gateway."));
      }
    }
  }

  formatMessages(messagesData) {
    let messages = [];

    if (messagesData) {
      for (let message of messagesData) {
        const data = {
          type: message.username ? "BUYER" : "SELLER",   // Bot has "username" while actual users have "user" property
          account: message.username,
          timestamp: new Date(parseInt(message.ts) * 1000),
          message: message.text,
        };
        messages.push(data);
      }
    }
    return messages;
  }
}

module.exports = ChatController;
