// @ts-nocheck
const mongoose = require("mongoose");
const { Schema } = mongoose;
const collections = require("../collections.json");

const EVENT = collections.EVENT;

const voucherSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
  },
  eventDetected: {
    type: Boolean,
    required: true,
    default: false,
  },
  _correlationId: {
    type: String,
    required: false,
  },
  //_tokenIdSupply || _tokenIdVoucher
  _tokenId: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model(EVENT, voucherSchema);
