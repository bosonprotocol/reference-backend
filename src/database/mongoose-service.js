// @ts-nocheck

const Product = require('./models/Product')
const User = require('./models/User');
const Voucher = require('./models/Voucher');

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

    static async createVoucher(metadata, fileRefs) {

        const voucher = new Voucher({
            title: metadata.title,
            qty: metadata.qty,
            category: metadata.category,
            expiryDate: new Date(metadata.expiryDate),
            description: metadata.description,
            status: metadata.status,
            userAddress: metadata.userAddress,
            imageFiles: fileRefs
        });
        
        await voucher.save();
    }

    static async updateVoucher(id, metadata) {
        
        await Voucher.findByIdAndUpdate(id, {
            title: metadata.title,
            qty: metadata.qty,
            category: metadata.category,
            expiryDate: new Date(metadata.expiryDate),
            description: metadata.description,
            status: metadata.status,
            userAddress: metadata.userAddress,
        },      
        { useFindAndModify: false, new: true, upsert: true,  }
    )}

    static async deleteVoucher(id) {
        await Voucher.findByIdAndDelete(id)
    }

    static async getVoucher(id) {
        return await Voucher.findById(id)
    }

    static async buy() {
    }

}

module.exports = MongooseService;