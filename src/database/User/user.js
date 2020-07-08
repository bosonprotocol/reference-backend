// @ts-nocheck
const User = require('../models/User')
const Voucher = require('../models/Voucher')

class UserService {
    static async getNonce(address) {
        let user = await User.findOne({ address })
        return user.nonce;
    }

    static async preserveNonce(address, nonce) {

        await User.findOneAndUpdate(
            { address: address},
            { address, nonce },
            { new: true, upsert: true }
        )
    }

    static async getMyVouchers(address) {
        const voucherIDs = (await User.findOne({ address })).vouchers

        return await Voucher.where('_id').in(voucherIDs).select(['title', 'description', 'price', 'imagefiles'])
    }
}

module.exports = UserService