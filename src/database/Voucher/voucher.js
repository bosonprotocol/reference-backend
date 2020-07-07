//@ts-nocheck
const Voucher = require('../models/Voucher')

class VoucherService {
    static async getVouchersByOwner(voucherOwner) {
        return await Voucher.where('voucherOwner').equals(voucherOwner.toLowerCase()).lean()
    }

    static async getVouchersByBuyer(voucherOwner) {
        return await Voucher.where('voucherOwner').ne(voucherOwner.toLowerCase()).lean()
    }

    static async createVoucher(metadata, fileRefs) {

        const voucher = new Voucher({
            title: metadata.title,
            qty: metadata.qty,
            category: metadata.category,
            expiryDate: metadata.expiryDate,
            description: metadata.description,
            status: metadata.status,
            voucherOwner: metadata.voucherOwner,
            imageFiles: fileRefs
        });

        await voucher.save();
    }

    static async updateVoucher(id, metadata, fileRefs) {
        const voucher = await this.getVoucher(id);
        const currentImages = voucher.imageFiles;
        const updatedImages = [...currentImages, ...fileRefs]

        await Voucher.findByIdAndUpdate(id, {
            title: metadata.title,
            qty: metadata.qty,
            category: metadata.category,
            expiryDate: metadata.expiryDate,
            description: metadata.description,
            status: metadata.status,
            voucherOwner: metadata.voucherOwner,
            imageFiles: updatedImages
        },
            { useFindAndModify: false, new: true, upsert: true, }
        )
    }

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
}

module.exports = VoucherService;