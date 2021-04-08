// @ts-nocheck
const mongoose = require("mongoose");
const { Schema } = mongoose;
const collections = require("../collections.json");

const EVENT = collections.EVENT;

const voucherSchema = new Schema({
  eventName: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  eventDetected: {
    type: String,
    required: true,
    default: false,
  },
  _correlationId: {
    type: String,
    required: false,
  },
  _tokenId: { //_tokenIdSupply || _tokenIdVoucher
    type: String,
    required: false,
  },
});

module.exports = mongoose.model(EVENT, voucherSchema);