const { WebClient } = require("@slack/web-api");
const VouchersRepository = require("../../database/Voucher/VouchersRepository");
const VoucherSuppliesRepository = require("../../database/VoucherSupply/VoucherSuppliesRepository");
const { setSocketConnections } = require("../../utils/socketConnections");
const { shortenAddress } = require("../../utils/shortenAddress");

class ChatController {
  constructor(config) {
    this.web = new WebClient(config.slackToken);
    this.channel = config.channelId;
    this.chatRepository = config.chatRepository;
    this.NEW_CHAT_MESSAGE_EVENT = "message";
    this.io;
    this.createWebSocketService();
    this.socketConnections = new Map();
    this.vouchersRepository = new VouchersRepository();
    this.voucherSuppliesRepository = new VoucherSuppliesRepository();
  }

  createWebSocketService() {
    const webSocketPORT = process.env.WS_PORT;
    const server = require("http").createServer();
    this.io = require("socket.io")(server, {
      cors: {
        origin: "*",
      },
    });
    server.listen(webSocketPORT, () => {
      console.log(`WS listening on port ${webSocketPORT}`);
    });
  }

  async executeSocketOperations(
    socket,
    existingMetaData,
    title,
    address,
    voucherURL
  ) {
    const thread = existingMetaData.thread_ts;
    // Join a room
    socket.join(thread);
    // Add thread ID to connections array
    this.socketConnections.set(thread, this.io);
    setSocketConnections(this.socketConnections);
    // Get messages from thread
    const messagesData = {
      ...(await this.getSlackThread(existingMetaData.channel, thread)),
      address,
    };
    // Extract and render messages
    const messages = this.formatMessages(messagesData.messages);
    // Emit all messages after successful connection
    this.io.in(thread).emit(this.NEW_CHAT_MESSAGE_EVENT, messages);
    // Listen for new messages
    socket.on(this.NEW_CHAT_MESSAGE_EVENT, async (data) => {
      // Attach title and voucher URL
      data.title = title;
      data.voucherURL = voucherURL;
      // Emit newest message
      this.relayMessageOperations(existingMetaData, data);
    });
    // Leave the room if the user closes the socket
    socket.on("disconnect", () => {
      socket.leaveAll();
      socket.disconnect(true);
      this.socketConnections.delete(thread);
      setSocketConnections(this.socketConnections);
      console.log("DISCONNECTION " + thread);
    });
  }

  async relayMessageOperations(existingMetaData, data) {
    const relayMessageToSlackData = await this.relayMessageToSlack(data);
    await this.storeChatMetaDataIfNew(relayMessageToSlackData);
    const messagesData = await this.getSlackThread(
      existingMetaData.channel,
      existingMetaData.thread_ts
    );
    const msg = this.formatMessages(messagesData.messages);
    this.io
      .in(existingMetaData.thread_ts)
      .emit(this.NEW_CHAT_MESSAGE_EVENT, msg);
  }

  /**
   * Get the parameters coming from the request object and
   * check if thread with the unique room ID exists.
   * @returns metadata/null (success/failure)
   */
  async openWS(req, res) {
    const voucherIdRequest = req.params.voucherId;
    const addressRequest = req.params.address;
    const roomIdRequest = [voucherIdRequest, addressRequest].join(",");
    let existingMetaDataRequest = await this.chatRepository.getThread(
      roomIdRequest
    );

    const voucherURL = `${req.headers.origin}/voucher-sets/${voucherIdRequest}/details?direct=1`;
    const { supplyID } = await this.vouchersRepository.getVoucherById(
      voucherIdRequest
    );
    const { title } = await this.voucherSuppliesRepository.getVoucherSupplyById(
      supplyID
    );

    this.io.on("connection", async (socket) => {
      console.log("CONNECTION");
      this.io.removeAllListeners();
      // Get parameters from the WS query object
      const { address, voucherId, message } = socket.handshake.query;
      const roomId = [voucherId, address].join(",");
      // Get thread from Slack API
      const existingMetaData = await this.chatRepository.getThread(roomId);

      if (existingMetaData !== null) {
        const ifConnection = this.socketConnections.has(
          existingMetaData.thread_ts
        );

        if (ifConnection) {
          this.socketConnections.delete(existingMetaData.thread_ts);
          setSocketConnections(this.socketConnections);
          socket.leaveAll();
          console.log("REMOVE SOCKET INSTANCE AND LEAVE ALL JOINED ROOMS");
        }

        console.log(
          "EXECUTING ACTION ON ALREADY CREATED THREAD: " +
            existingMetaData.thread_ts
        );

        await this.executeSocketOperations(
          socket,
          existingMetaData,
          title,
          address,
          voucherURL
        );
      } else {
        /**
         * @param message String
         * If we don't have existing metadata (we haven't posted any message till that moment)
         * and we have a message attached to our query in WS params
         */
        if (message) {
          console.log("OPENING THREAD MESSAGE");

          const requestData = {
            address,
            voucherId,
            message,
            title,
            voucherURL,
          };

          const initialMessageResponse = await this.relayMessageToSlack(
            requestData
          );

          await this.storeChatMetaDataIfNew(initialMessageResponse);
          const existingMetaData = await this.chatRepository.getThread(roomId);
          existingMetaDataRequest = true;
          await this.executeSocketOperations(socket, existingMetaData, address);
        }
      }
    });

    res
      .status(200)
      .send({ metadataExists: existingMetaDataRequest ? true : false });
  }

  /**
   * @param voucherId Voucher ID coming from ID supplies
   * @param address Address of user
   * @param message String
   * @param voucherURL URL address pointing to voucher set details page
   * @param title String
   * @returns Object
   */
  async relayMessageToSlack({
    voucherId,
    address,
    message,
    voucherURL,
    title,
  }) {
    // Post the message to the slack channel
    try {
      const existingMetaData = await this.chatRepository.getThread(
        [voucherId, address].join(",")
      );
      const thread_ts = existingMetaData ? existingMetaData.thread_ts : "";

      const result = await this.web.chat.postMessage({
        text: existingMetaData ? message : `${voucherURL}\n${message}`,
        channel: this.channel,
        username: `${shortenAddress(address)} - ${title}`,
        thread_ts: thread_ts,
        icon_emoji: ":information_desk_person:",
      });

      return {
        key: {
          voucherId: voucherId,
          address: address,
        },
        metadata: {
          channel: result.channel,
          thread_ts: result.ts,
        },
      };
    } catch (e) {
      console.log(e);
    }
  }

  async storeChatMetaDataIfNew(data) {
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
  }

  async getSlackThread(channel, thread) {
    if (channel && thread) {
      try {
        const result = await this.web.conversations.replies({
          channel,
          ts: thread,
        });
        return result;
      } catch (e) {
        console.log(e);
      }
    }
  }

  formatMessages(messagesData) {
    let messages = [];

    if (messagesData) {
      for (let message of messagesData) {
        const data = {
          type: message.username ? "BUYER" : "SELLER", // Bot has "username" while actual users have "user" property
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
