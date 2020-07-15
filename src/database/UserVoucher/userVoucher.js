const UserVoucher = require('../models/UserVoucher')
const status = require('../../utils/userVoucherStatus')
class UserVoucherService {
    static async createUserVoucher(metadata, voucherID) {
        await UserVoucher.findOneAndUpdate(
            { _tokenIdVoucher: metadata._tokenIdVoucher },
            { 
                voucherID: voucherID,
                txHash: metadata.txHash,
                _holder: metadata._holder.toLowerCase(),
                _promiseId: metadata._promiseId,
                _tokenIdSupply: metadata._tokenIdSupply,
                _tokenIdVoucher: metadata._tokenIdVoucher,
                status: status.COMMITTED,
                voucherOwner: metadata._issuer.toLowerCase()
            },
            { new: true, upsert: true }
        )
    }
   
    static async getMyVouchers(userAddress) {
        return await UserVoucher.find({ _holder: userAddress})
    }

    static async getMyVoucherByID(voucherID) {
        return  await UserVoucher.findById(voucherID)
    }

    static async findUserVoucherById(myVoucherId) {
        return await UserVoucher.findById(myVoucherId)
    }

    static async updateMyVoucherStatus(voucherID, status) {
        const myVoucher =  await UserVoucher.findById(voucherID)
        return await UserVoucher.findByIdAndUpdate(voucherID, 
            { status },
            { useFindAndModify: false, new: true, upsert: true, }
        )
    }
}

module.exports = UserVoucherService;