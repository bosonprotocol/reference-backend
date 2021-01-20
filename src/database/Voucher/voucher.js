//@ts-nocheck
const Voucher = require('../models/Voucher')

class VoucherService {

    static async getVouchersByOwner(voucherOwner) {
        return await Voucher.where('voucherOwner').equals(voucherOwner).select(['title', 'price', 'description', 'imagefiles', 'expiryDate', 'startDate', 'qty', 'visible']).sort({ offeredDate: 'desc' }).lean()
    }

    static async getVouchersByBuyer(voucherOwner) {
        const today = new Date(Date.now())

        return await Voucher.where('voucherOwner')
            .ne(voucherOwner)
            .where('startDate').lte(today)
            .where('expiryDate').gte(today)
            .where('qty').gt(0)
            .select(['title', 'price', 'description', 'imagefiles', 'expiryDate', 'visible'])
            .sort({ offeredDate: 'desc' }).lean()
    }

    static async getActiveVouchers(address) {
        const today = new Date(Date.now())

        return await Voucher
            .where('voucherOwner').equals(address.toLowerCase())
            .where('startDate').lte(today)
            .where('expiryDate').gte(today)
            .where('qty').gt(0)
            .select(['title', 'price', 'voucherOwner','qty', 'description', 'imagefiles', 'startDate', 'expiryDate', 'visible']).sort({ offeredDate: 'desc' }).lean()
    }

    static async getInactiveVouchers(address) {
        const today = new Date(Date.now())

        return await Voucher
            .where('voucherOwner').equals(address.toLowerCase())
            .or([
                { startDate: { $gte: today } }, 
                { expiryDate: { $lte: today }},
                { qty: { $lte: 0 } }
            ])
            .select(['title', 'price', 'voucherOwner', 'description', 'imagefiles', 'startDate', 'expiryDate', 'visible']).sort({ offeredDate: 'desc' }).lean()
    }

    static async createVoucher(metadata, fileRefs, voucherOwner) {

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
            location: metadata.location,
            contact: metadata.contact,
            conditions: metadata.conditions,
            voucherOwner: voucherOwner,
            visible: true,
            txHash: metadata.txHash,
            _tokenIdSupply: metadata._tokenIdSupply,
            _promiseId: metadata._promiseId,
            _nonce: metadata._nonce,
            imagefiles: fileRefs,
        });

        return await voucher.save();
    }

    static async updateVoucher(voucher, metadata, fileRefs) {
        const currentImages = voucher.imagefiles;
        const updatedImages = [...currentImages, ...fileRefs]
        
        await Voucher.findByIdAndUpdate(voucher.id, {
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

    static async updateVoucherFromEvent(metadata) {
        //find voucher from seller address and its nonce
        console.log(metadata);

        let test =  await Voucher.findOneAndUpdate(
            {
                voucherOwner: metadata._seller,
                _nonce: metadata._nonce
            },
            { _tokenIdSupply: metadata._tokenIdSupply,
                // _seller: '0x5af2b312ec207d78c4de4e078270f0d8700c01e2',
                // _quantity: 1,
                _paymentType: metadata._paymentType,
                _nonce: metadata._nonce },
            { new: true, upsert: true }
        )

        console.log('test');
        console.log(test);
    }

    static async updateVoucherQty(voucherID) {
        const voucher = await this.getVoucher(voucherID);

        return await Voucher.findByIdAndUpdate(voucherID, {
            qty: --voucher.qty,
        },
            { useFindAndModify: false, new: true, upsert: true, }
        )
    }

    static async updateVoucherVisibilityStatus(voucherID) {
        const voucher = await this.getVoucher(voucherID);

        return await Voucher.findByIdAndUpdate(voucherID, {
            visible: voucher.visible ? false : true
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
            expiryDate: voucherDetailsDocument._doc.expiryDate,
            visible: voucherDetailsDocument._doc.visible
        }

        voucherData.push(
            voucher
        )
    }
}

module.exports = VoucherService;