const mongoose = require('mongoose');
const { base64 } = require('ethers/utils');
const { Schema } = mongoose;
const collections = require('../collections.json');
const USER = collections.USER;
const VOUCHER = collections.VOUCHER;

const voucherSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    qty: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: false
    },
    expiryDate: {
        type: Date,
        required: false
    },
    description: {
        type: String,
        required: false
    },
    imageFiles: {
        type: Array,
        required: true
    },
    status: {
        type: String, // active || inactive
        default: false
    },
    voucherOwner: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model(VOUCHER, voucherSchema)