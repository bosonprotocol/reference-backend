// @ts-nocheck
const BuyersChat = require("../models/BuyersChat");

class BuyersChatRepository {
    async getThread(chatId) {
        return BuyersChat.findOne({ chatId: chatId }, 'thread_ts channel');
    }

    async createThread({ chatId, thread_ts, channel }) {

        const buyersChat = new BuyersChat({
            chatId,
            thread_ts,
            channel
        });

        const buyersChatSaved = await buyersChat.save();
        console.log(buyersChatSaved)
        return buyersChatSaved;
    }
}

module.exports = BuyersChatRepository;