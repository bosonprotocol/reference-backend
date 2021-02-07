// @ts-nocheck

const mongoose = require("mongoose");
const { Schema } = mongoose;
const collections = require("../collections.json");
const VOUCHER_SUPPLY = collections.VOUCHER_SUPPLY;

const voucherSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  qty: {
    type: Number,
    required: true,
    validate(value) {
      if (value < 0) {
        throw new Error("Qty must be a positive number");
      }
    },
  },
  price: {
    type: Schema.Types.Decimal128,
    required: true,
  },
  buyerDeposit: {
    type: Schema.Types.Decimal128,
    required: true,
  },
  sellerDeposit: {
    type: Schema.Types.Decimal128,
    required: true,
  },
  category: {
    type: String,
    required: false,
  },
  startDate: {
    type: Date,
    required: false,
  },
  expiryDate: {
    type: Date,
    required: false,
  },
  offeredDate: {
    type: Date,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  contact: {
    type: String,
    required: true,
    trim: true,
  },
  conditions: {
    type: String,
    required: true,
    trim: true,
  },
  imagefiles: {
    type: Array,
    required: true,
  },
  voucherOwner: {
    type: String,
    required: true,
  },
  voucherStatus: {
    type: String,
  },
  visible: {
    type: Boolean,
    required: true,
  },
  _tokenIdSupply: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model(VOUCHER_SUPPLY, voucherSchema);
