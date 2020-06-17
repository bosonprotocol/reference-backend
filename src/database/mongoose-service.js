const Product = require('./models/Product')
const User = require('./models/User')

class MongooseService {

    static async createProduct(reqBody) {
        const product = new Product(reqBody)
        await product.save();
    }

    static async getNonce(address) {
        let user = await User.findOne({ address })
        return user.nonce;
    }

    static async preserveNonce(address, nonce) {

        await User.findOneAndUpdate(
            { address: address }, 
            { address, nonce },
            {  new: true, upsert: true }
        )
        
    }

    static async buy() {
    }

}

module.exports = MongooseService;