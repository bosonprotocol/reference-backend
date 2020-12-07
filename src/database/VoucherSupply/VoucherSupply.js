//@ts-nocheck
const VoucherSupply = require('../models/VoucherSupply')

class VoucherSupplyService {

    static async getVouchersByOwner(voucherOwner) {
        return await VoucherSupply.where('voucherOwner').equals(voucherOwner).select(['title', 'price', 'description', 'imagefiles', 'expiryDate', 'startDate', 'qty', 'visible']).sort({ offeredDate: 'desc' }).lean()
    }

    static async getVouchersByBuyer(voucherOwner) {
        const today = new Date(Date.now())

        return await VoucherSupply.where('voucherOwner')
            .ne(voucherOwner)
            .where('startDate').lte(today)
            .where('expiryDate').gte(today)
            .where('qty').gt(0)
            .select(['title', 'price', 'description', 'imagefiles', 'expiryDate', 'visible'])
            .sort({ offeredDate: 'desc' }).lean()
    }

    static async getActiveSupplies(address) {
        const today = new Date(Date.now())

        return await VoucherSupply
            .where('voucherOwner').equals(address.toLowerCase())
            .where('startDate').lte(today)
            .where('expiryDate').gte(today)
            .where('qty').gt(0)
            .select(['title', 'price', 'voucherOwner','qty', 'description', 'imagefiles', 'startDate', 'expiryDate', 'visible']).sort({ offeredDate: 'desc' }).lean()
    }

    static async getInactiveSupplies(address) {
        const today = new Date(Date.now())

        return await VoucherSupply
            .where('voucherOwner').equals(address.toLowerCase())
            .or([
                { startDate: { $gte: today } }, 
                { expiryDate: { $lte: today }},
                { qty: { $lte: 0 } }
            ])
            .select(['title', 'price', 'voucherOwner', 'description', 'imagefiles', 'startDate', 'expiryDate', 'visible']).sort({ offeredDate: 'desc' }).lean()
    }

    static async createVoucherSupply(metadata, fileRefs, voucherOwner) {

        const voucherSupply = new VoucherSupply({
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
            location: metadata.location,
            contact: metadata.contact,
            conditions: metadata.conditions,
            voucherOwner: voucherOwner,
            visible: true,
            txHash: metadata.txHash,
            _tokenIdSupply: metadata._tokenIdSupply,
            _promiseId: metadata._promiseId,
            imagefiles: fileRefs,
        });

        await voucherSupply.save();
    }

    static async updateVoucherSupply(voucher, metadata, fileRefs) {
        const currentImages = voucher.imagefiles;
        const updatedImages = [...currentImages, ...fileRefs]
        
        await VoucherSupply.findByIdAndUpdate(voucher.id, {
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
            location: metadata.location,
            contact: metadata.contact,
            conditions: metadata.conditions,
            imagefiles: updatedImages
            },
            { useFindAndModify: false, new: true, upsert: true, }
        )
    }

    static async updateVoucherQty(voucherID) {
        const voucherSupply = await this.getVoucherSupply(voucherID);

        return await VoucherSupply.findByIdAndUpdate(voucherID, {
            qty: --voucher.qty,
        },
            { useFindAndModify: false, new: true, upsert: true, }
        )
    }

    static async updateVoucherVisibilityStatus(voucherID) {
        const voucherSupply = await this.getVoucherSupply(voucherID);

        return await VoucherSupply.findByIdAndUpdate(voucherID, {
            visible: voucher.visible ? false : true
        },
            { useFindAndModify: false, new: true, upsert: true, }
        )
    }

    static async deleteVoucherSupply(id) {
        await VoucherSupply.findByIdAndDelete(id)
    }

    static async deleteImage(id, imageUrl) {
        const voucherSupply = await this.getVoucherSupply(id);
        const currentImages = voucherSupply.imagefiles;
        const updatedImages = currentImages.filter(image => image.url != imageUrl);

        await VoucherSupply.findByIdAndUpdate(id, {
            imagefiles: updatedImages
        },
            { useFindAndModify: false, new: true, upsert: true, }
        );
    }

    static async getVoucherSupply(id) {
        return await VoucherSupply.findById(id)
    }

    static async getVouchersDetails(myVoucherDocument, voucherData) {
        const voucherDetailsDocument = await VoucherService.getVoucherSupply(myVoucherDocument.voucherID)

        const voucherSupply = {
            _id: myVoucherDocument.id,
            title: voucherDetailsDocument._doc.title,
            qty: voucherDetailsDocument._doc.qty,
            description: voucherDetailsDocument._doc.description,
            imagefiles: voucherDetailsDocument._doc.imagefiles,
            category: voucherDetailsDocument._doc.category,
            price: voucherDetailsDocument._doc.price,
            expiryDate: voucherDetailsDocument._doc.expiryDate,
            visible: voucherDetailsDocument._doc.visible
        }

        voucherData.push(
            voucherSupply
        )
    }
}

module.exports = VoucherSupplyService;