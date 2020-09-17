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
        type: Number,
        required: true
       
    },
    _payee: {
        type: String,
        required: true
    },
    txHash: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model(PAYMENT, paymentSchema)