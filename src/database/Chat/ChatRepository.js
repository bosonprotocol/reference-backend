// @ts-nocheck
const Chat = require("../models/Chat");

class ChatRepository {
  async getThread(chatId) {
    return Chat.findOne({ chatId: chatId }, "thread_ts channel");
  }

  async createThread({ chatId, thread_ts, channel }) {
    const chat = new Chat({
      chatId,
      thread_ts,
      channel,
    });

    return await chat.save();
  }
}

module.exports = ChatRepository;
