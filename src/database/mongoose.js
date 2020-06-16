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

        let result = await User.updateOne(
            { address: address },
            { nonce: nonce } 
        )

        if (!result.nModified) {
            
            let record = new User({address, nonce})
            await record.save()
        }
    }

    static async buy() {
    }

}

module.exports = MongooseService;