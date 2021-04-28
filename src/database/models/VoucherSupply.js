// @ts-nocheck
const mongoose = require("mongoose");
const { Schema } = mongoose;
const collections = require("../collections.json");
const { updateIfCurrentPlugin } = require("mongoose-update-if-current");

const VOUCHER_SUPPLY = collections.VOUCHER_SUPPLY;

const voucherSchema = new Schema({
  title: {
    type: String,
    required: false,
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
    type: Object,
    country: {
      type: String,
      required: false,
      trim: true,
    },
    city: {
      type: String,
      required: false,
      trim: true,
    },
    addressLineOne: {
      type: String,
      required: false,
      trim: true,
    },
    addressLineTwo: {
      type: String,
      required: false,
      trim: true,
    },
    postcode: {
      type: String,
      required: false,
      trim: true,
    },
  },
  contact: {
    type: String,
    required: false,
    trim: true,
  },
  conditions: {
    type: String,
    required: false,
    trim: true,
  },
  imagefiles: {
    type: Array,
    required: false,
  },
  voucherOwner: {
    type: String,
    required: false,
  },
  voucherStatus: {
    type: String,
  },
  visible: {
    type: Boolean,
    required: false,
  },
  _tokenIdSupply: {
    type: String,
    required: false,
  },
  _correlationId: {
    type: String,
    required: false,
  },
  _paymentType: {
    type: Number,
    required: false,
  },
  _promiseId: {
    type: String,
  },
  blockchainAnchored: {
    type: Boolean,
  },
});

voucherSchema.plugin(updateIfCurrentPlugin);

module.exports = mongoose.model(VOUCHER_SUPPLY, voucherSchema);
