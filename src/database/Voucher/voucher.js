//@ts-nocheck
const Voucher = require('../models/Voucher')

class VoucherService {
    static async getVouchersByOwner(voucherOwner) {
        return await Voucher.where('voucherOwner').equals(voucherOwner).select(['title', 'price', 'description', 'imagefiles']).lean()
    }

    static async getVouchersByBuyer(voucherOwner) {
        return await Voucher.where('voucherOwner').ne(voucherOwner).select(['title', 'price', 'description', 'imagefiles']).lean()
    }

    static async createVoucher(metadata, fileRefs) {

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
            txHash: metadata.txHash,
            _tokenIdSupply: metadata._tokenIdSupply,
            _promiseId: metadata._promiseId,
            imagefiles: fileRefs,
            
        });

        await voucher.save();
    }

    static async updateVoucher(id, metadata, fileRefs) {
        const voucher = await this.getVoucher(id);
        const currentImages = voucher.imagefiles;
        const updatedImages = [...currentImages, ...fileRefs]

        await Voucher.findByIdAndUpdate(id, {
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
            imagefiles: updatedImages
        },
            { useFindAndModify: false, new: true, upsert: true, }
        )
    }

    static async updateVoucherQty(voucherID) {
        const voucher = await this.getVoucher(voucherID);

        return await Voucher.findByIdAndUpdate(voucherID, {
            qty: --voucher.qty,
        },
            { useFindAndModify: false, new: true, upsert: true, }
        )
    }

    static async deleteVoucher(id) {
        await Voucher.findByIdAndDelete(id)
    }

    static async deleteImage(id, imageUrl) {
        const voucher = await this.getVoucher(id);
        const currentImages = voucher.imagefiles;
        const updatedImages = currentImages.filter(image => image.url != imageUrl);

        await Voucher.findByIdAndUpdate(id, {
            imagefiles: updatedImages
        },
            { useFindAndModify: false, new: true, upsert: true, }
        );
    }

    static async getVoucher(id) {
        return await Voucher.findById(id)
    }

    static async getVouchersDetails(myVoucherDocument, voucherData) {
        const voucherDetailsDocument = await VoucherService.getVoucher(myVoucherDocument.voucherID)

        const voucher = {
            _id: myVoucherDocument.id,
            title: voucherDetailsDocument._doc.title,
            qty: voucherDetailsDocument._doc.qty,
            description: voucherDetailsDocument._doc.description,
            imagefiles: voucherDetailsDocument._doc.imagefiles,
            category: voucherDetailsDocument._doc.category,
            price: voucherDetailsDocument._doc.price,
        }

        voucherData.push(
            voucher
        )
    }
}

module.exports = VoucherService;