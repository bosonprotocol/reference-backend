// @ts-nocheck
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const collections = require('../collections.json');
const USER = collections.USER;

const userSchema = new Schema({
    address: {
        type: String,
        required: true,
        trim: true,
    },
    nonce: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Nonce must be a postive number');
            }
        },
    },
    role: {
        type: String,
        required: true,
        trim: true,
    },
});

module.exports = mongoose.model(USER, userSchema);
