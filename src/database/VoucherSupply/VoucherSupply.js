//@ts-nocheck
const VoucherSupply = require('../models/VoucherSupply')

class VoucherSupplyService {

    static async getVoucherSuppliesByOwner(voucherOwner) {
        return await VoucherSupply.where('voucherOwner').equals(voucherOwner).select(['title', 'price', 'description', 'imagefiles', 'expiryDate', 'startDate', 'qty', 'visible']).sort({ offeredDate: 'desc' }).lean()
    }

    static async getVoucherSuppliesByBuyer(voucherOwner) {
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
            imagefiles: fileRefs,
        });

        return await voucherSupply.save();
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

    static async updateVoucherQty(supplyID) {
        const voucherSupply = await this.getVoucherSupply(supplyID);

        return await VoucherSupply.findByIdAndUpdate(supplyID, {
            qty: --voucherSupply.qty,
        },
            { useFindAndModify: false, new: true, upsert: true, }
        )
    }

    static async updateVoucherVisibilityStatus(supplyID) {
        const voucherSupply = await this.getVoucherSupply(supplyID);

        return await VoucherSupply.findByIdAndUpdate(supplyID, {
            visible: voucherSupply.visible ? false : true
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

    static async getVoucherSupplyBySupplyID(supplyID) {
        return await VoucherSupply.findOne({_tokenIdSupply: supplyID})
    }

    static async getVouchersSupplyDetails(userVoucher, voucherData) {
        const voucherSupplyDetails = await this.getVoucherSupply(userVoucher.supplyID)

        const voucherSupply = {
            _id: userVoucher.id,
            title: voucherSupplyDetails._doc.title,
            qty: voucherSupplyDetails._doc.qty,
            description: voucherSupplyDetails._doc.description,
            imagefiles: voucherSupplyDetails._doc.imagefiles,
            category: voucherSupplyDetails._doc.category,
            price: voucherSupplyDetails._doc.price,
            expiryDate: voucherSupplyDetails._doc.expiryDate,
            visible: voucherSupplyDetails._doc.visible
        }

        voucherData.push(
            voucherSupply
        )
    }
}

module.exports = VoucherSupplyService;