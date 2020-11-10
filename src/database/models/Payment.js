// @ts-nocheck

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const collections = require('../collections.json');
const PAYMENT = collections.PAYMENT;

const paymentSchema = new Schema({
    _tokenIdVoucher: {
        type: String,
        required: true,
        trim: true
    },
    _payment: {
        type: Schema.Types.Decimal128,
        required: true
       
    },
    _to: {
        type: String,
        required: true
    },
    txHash: {
        type: String,
        required: true
    },
    // _type: 0 - Payment, 1 - Seller Deposit, 2 - Buyer Deposit
    _type: {
        type: Number,
        required: true,
        trim: true
    }
})

module.exports = mongoose.model(PAYMENT, paymentSchema)