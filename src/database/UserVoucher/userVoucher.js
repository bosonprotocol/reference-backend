const UserVoucher = require('../models/UserVoucher')
const status = require('../../utils/userVoucherStatus')

class UserVoucherService {
    static async createUserVoucher(metadata, voucherID) {

        const userVoucher = new UserVoucher({
                    voucherID: voucherID, //TODO to be rename to voucherSetRefID
                    _holder: metadata._holder.toLowerCase(),
                    _tokenIdSupply: metadata._tokenIdSupply,
                    _nonce: metadata._nonce,
                    [status.COMMITTED]: new Date().getTime(),
                    [status.CANCELLED]: '',
                    [status.COMPLAINED]: '',
                    [status.REDEEMED]: '',
                    [status.REFUNDED]: '',
                    [status.FINALIZED]: '',
                    voucherOwner: metadata._issuer.toLowerCase(),
                    actionDate: new Date().getTime()
        })

        return await userVoucher.save();
    }

    static async updateVoucherDelivered(metadata) {

        return await UserVoucher.findOneAndUpdate(
            { _nonce: metadata._nonce, _holder: metadata._holder.toLowerCase() },
            { _tokenIdVoucher: metadata._tokenIdVoucher },
            { new: true, upsert: true, }
        )
    }

    static async getMyVouchers(userAddress) {
        return await UserVoucher.find({ _holder: userAddress }).sort({ actionDate: 'desc' })
    }

    static async getMyVoucherByID(voucherID) {
        return await UserVoucher.findById(voucherID)
    }

    static async findUserVoucherById(myVoucherId) {
        return await UserVoucher.findById(myVoucherId)
    }

    static async findUserVoucherByTokenIdVoucher(_tokenIdVoucher) {
        return await UserVoucher.findOne({ _tokenIdVoucher })
    }

    static async findAllUsersByVoucherID(voucherID, owner) {
        return await UserVoucher
            .where('voucherID').equals(voucherID)
            .where('voucherOwner').equals(owner)
        // removed for POC to be able to show table with statuses when cancel or fault is executed
        // .where(status.CANCELLED).equals('')
    }

    static async updateMyVoucherOnCommonEvent(voucherID, metadata) {

        return await UserVoucher.findByIdAndUpdate(voucherID,
            {
                ...metadata
            },
            {  new: true, upsert: true, }
        )
    }

    static async finalizeVoucher(tokenID, status) {
        return await UserVoucher.findOneAndUpdate({ _tokenIdVoucher: tokenID },
            {
                [status]: new Date().getTime()
            },
            { new: true, upsert: true, }
        )
    }

    static async getAllVouchers() {
        return UserVoucher.find({});
    }
}

module.exports = UserVoucherService;
