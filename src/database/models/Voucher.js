// @ts-nocheck

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
        required: true,
        validate(value) {
            if (value < 0) {
                throw new Error('Qty must be a postive number')
            }
        }
    },
    price: {
        type: Number,
        required: true
    },
    buyerDeposit: {
        type: Number,
        required: true
    },
    sellerDeposit: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: false
    },
    startDate: {
        type: Date,
        required: false
    },
    expiryDate: {
        type: Date,
        required: false
    },
    offeredDate: {
        type: Date,
        required: false 
    },
    description: {
        type: String,
        required: false
    },
    imagefiles: {
        type: Array,
        required: true
    },
    voucherOwner: {
        type: String,
        required: true
    },
    voucherStatus: {
        type: String
    },
    txHash: {
        type: String,
        required: true,
    },
    _tokenIdSupply: {
        type: String,
        required: true,
    },
    _promiseId: {
        type: String,
        required: true,
    },
})

module.exports = mongoose.model(VOUCHER, voucherSchema)