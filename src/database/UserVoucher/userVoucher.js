const UserVoucher = require('../models/UserVoucher')
const status = require('../../utils/userVoucherStatus')
class UserVoucherService {
    static async createUserVoucher(metadata, voucherID) {
        return await UserVoucher.findOneAndUpdate(
            { _tokenIdVoucher: metadata._tokenIdVoucher },
            { 
                voucherID: voucherID,
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
   
    static async getMyVouchers(userAddress) {
        return await UserVoucher.find({ _holder: userAddress }).sort({ actionDate: 'desc' })
    }

    static async getMyVoucherByID(voucherID) {
        return await UserVoucher.findById(voucherID)
    }

    static async findUserVoucherById(myVoucherId) {
        return await UserVoucher.findById(myVoucherId)
    }

    static async findAllUsersByVoucherID(voucherID, owner) {
        return  await UserVoucher
            .where('voucherID').equals(voucherID)
            .where('voucherOwner').equals(owner)
            .where(status.CANCELLED).equals('')
    }

    static async updateMyVoucherStatus(voucherID, status) {
        return await UserVoucher.findByIdAndUpdate(voucherID, 
            { 
                [status]: new Date().getTime()
            },
            { useFindAndModify: false, new: true, upsert: true, }
        )
    }

    static async finalizeVoucher(tokenID, status) {
        return await UserVoucher.findOneAndUpdate({ _tokenIdVoucher: tokenID},
            {
                [status]: new Date().getTime()
            },
            { useFindAndModify: false, new: true, upsert: true, }
        )
    }
}

module.exports = UserVoucherService;