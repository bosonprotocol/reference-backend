const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    address: {
        type: String,
        required: true,
        trim: true
    },
    nonce: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Nonce must be a postive number')
            }
        }
    }
})

const User = mongoose.model('User', userSchema)

module.exports = User