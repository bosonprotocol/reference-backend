const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const PRODUCT = 'Product';

const productSchema = new Schema({
    type: {
        type: String
    },
    price: {
        type: Number
    }
})

module.exports = mongoose.model(PRODUCT, productSchema)