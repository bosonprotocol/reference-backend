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

    static async commitToBuy(address, metadata) {
        //TODO should first validate if we have enought qty // да питам жорката дали във валидатора мога да си викна монгуса да си взема ваучер-а, за qty-to

        const user = await User.findOne({ address })
        const oldVouchers = user.vouchers
        const updatedVouchers = [...oldVouchers, metadata._tokenIdVoucher]
        
        await User.findOneAndUpdate(
            { address: address },
            { vouchers: updatedVouchers },
            { new: true, upsert: true }
        )

        //after this update we have to update voucher qty as well
    }
}

module.exports = UserService