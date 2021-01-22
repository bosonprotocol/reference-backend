// @ts-nocheck

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const collections = require('../collections.json');
const USER = collections.USER;
const USER_VOUCHER = collections.USER_VOUCHER;

const userSchema = new Schema({
    voucherID: {
        type: String,
        required: true,
        trim: true
    },
    _holder: {
        type: String,
    },
    _tokenIdSupply: {
        type: String
    },
    _tokenIdVoucher: {
        type: String
    },
    voucherOwner: {
        type: String
    },
    COMMITTED: {
        type: Date,
        required: false
    },
    REDEEMED: {
        type: Date,
        required: false
    },
    REFUNDED: {
        type: Date,
        required: false
    },
    COMPLAINED: {
        type: Date,
        required: false
    },
    CANCELLED: {
        type: Date,
        required: false
    },
    FINALIZED: {
        type: Date,
        required: false
    },
    actionDate: {
        type: Date,
        required: false
    },
    _transactionID: {
        type: Number,
        required: false
    }
})

module.exports = mongoose.model(USER_VOUCHER, userSchema)