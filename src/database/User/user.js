// @ts-nocheck
const User = require('../models/User')

class UserService {
    static async getNonce(address) {
        let user = await User.findOne({ address })
        return user.nonce;
    }

    static async preserveNonce(address, nonce) {

        await User.findOneAndUpdate(
            { address: address },
            { address, nonce },
            { new: true, upsert: true }
        )

    }
}

module.exports = UserService