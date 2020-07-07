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

    static async getVouchersByOwner(voucherOwner) {
        return await Voucher.where('voucherOwner').equals(voucherOwner.toLowerCase()).lean()
    }

    static async getVouchersByBuyer(voucherOwner) {
        return await Voucher.where('voucherOwner').ne(voucherOwner.toLowerCase()).lean()
    }

    static async createVoucher(metadata, fileRefs) {
        console.log('create metadata');
        console.log(metadata);
        
        
        
        const voucher = new Voucher({
            title: metadata.title,
            qty: metadata.qty,
            category: metadata.category,
            startDate: metadata.startDate,
            expiryDate: metadata.expiryDate,
            offeredDate: metadata.offeredDate,
            price: metadata.price,
            buyerDeposit: metadata.buyerDeposit,
            sellerDeposit: metadata.sellerDeposit,
            description: metadata.description,
            status: metadata.status,
            voucherOwner: metadata.voucherOwner,
            imageFiles: fileRefs
        });
        
        await voucher.save();
    }

    static async updateVoucher(id, metadata, fileRefs) {
        console.log('update metadata');
        console.log(metadata);
        const voucher = await this.getVoucher(id);
        const currentImages = voucher.imageFiles;
        const updatedImages = [...currentImages, ...fileRefs]

        await Voucher.findByIdAndUpdate(id, {
                title: metadata.title,
                qty: metadata.qty,
                category: metadata.category,
                startDate: metadata.startDate,
                expiryDate: metadata.expiryDate,
                price: metadata.price,
                buyerDeposit: metadata.buyerDeposit,
                sellerDeposit: metadata.sellerDeposit,
                description: metadata.description,
                status: metadata.status,
                voucherOwner: metadata.voucherOwner,
                imageFiles: updatedImages
            },      
            { useFindAndModify: false, new: true, upsert: true,  }
        )}

    static async deleteVoucher(id) {
        await Voucher.findByIdAndDelete(id)
    }

    static async deleteImage(id, imageUrl) {
        const voucher = await this.getVoucher(id);
        const currentImages = voucher.imageFiles;
        const updatedImages = currentImages.filter(image => image.url != imageUrl);
        
        await Voucher.findByIdAndUpdate(id, {
            imageFiles: updatedImages
        },
            { useFindAndModify: false, new: true, upsert: true, }
        );
    }

    static async getVoucher(id) {
        return await Voucher.findById(id)
    }

    static async buy() {
    }

}

module.exports = MongooseService;