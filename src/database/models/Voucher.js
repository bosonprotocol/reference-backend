// @ts-nocheck

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const collections = require('../collections.json');
const VOUCHER = collections.VOUCHER;

const userSchema = new Schema({
    supplyID: {
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
    status: {
        type: String,
        required: true
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
    _tokenIdSupply: {
        type: String,
        required: true,
    },
    FINALIZED: {
        type: Date,
        required: false
    },
    actionDate: {
        type: Date,
        required: false
    },
})

module.exports = mongoose.model(VOUCHER, userSchema)