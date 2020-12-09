const Voucher = require('../models/Voucher')
const status = require('../../utils/userVoucherStatus')

class VouchersService {
    static async createVoucher(metadata, supplyID) {
        return await Voucher.findOneAndUpdate(
            { _tokenIdVoucher: metadata._tokenIdVoucher },
            {
                supplyID: supplyID,
                txHash: metadata.txHash,
                _holder: metadata._holder.toLowerCase(),
                _promiseId: metadata._promiseId,
                _tokenIdSupply: metadata._tokenIdSupply,
                _tokenIdVoucher: metadata._tokenIdVoucher,
                [status.COMMITTED]: new Date().getTime(),
                [status.CANCELLED]: '',
                [status.COMPLAINED]: '',
                [status.REDEEMED]: '',
                [status.REFUNDED]: '',
                [status.FINALIZED]: '',
                voucherOwner: metadata._issuer.toLowerCase(),
                actionDate: new Date().getTime()
            },
            { new: true, upsert: true }
        )       
    }

    static async getUserVouchers(userAddress) {
        return await Voucher.find({ _holder: userAddress }).sort({ actionDate: 'desc' })
    }

    static async getVoucherByID(voucherID) {
        return await Voucher.findById(voucherID)
    }

    static async findVoucherById(myVoucherId) {
        return await Voucher.findById(myVoucherId)
    }

    static async createVoucher(metadata, fileRefs, voucherOwner) {

        try {
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
                imagefiles: fileRefs,
            });

            return await voucher.save();
        } catch (error) {
            throw new Error(error.message)
        }
    
    }

    static async findAllVouchersByVoucherSupplyID(supplyID, owner) {
        return await Voucher
            .where('supplyID').equals(supplyID)
            .where('voucherOwner').equals(owner)
        // removed for POC to be able to show table with statuses when cancel or fault is executed
        // .where(status.CANCELLED).equals('')
    }

    static async updateVoucherStatus(voucherID, status) {
        return await Voucher.findByIdAndUpdate(voucherID,
            {
                [status]: new Date().getTime()
            },
            { useFindAndModify: false, new: true, upsert: true, }
        )
    }

    static async finalizeVoucher(tokenID, status) {
        return await Voucher.findOneAndUpdate({ _tokenIdVoucher: tokenID },
            {
                [status]: new Date().getTime()
            },
            { useFindAndModify: false, new: true, upsert: true, }
        )
    }

    static async getAllVouchers() {
        return Voucher.find({});
    }
}

module.exports = VouchersService;
