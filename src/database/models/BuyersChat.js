// @ts-nocheck
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const collections = require("../collections.json");
const BUYERS_CHAT = collections.BUYERS_CHAT;

const buyersChatSchema = new Schema({
  chatId: {
    type: String,
    required: true,
  },
  channel: {
    type: String,
    required: true,
  },
  thread_ts: {
    type: String,
    required: true,
  }
});

module.exports = mongoose.model(BUYERS_CHAT, buyersChatSchema);