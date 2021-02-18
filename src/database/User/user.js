// @ts-nocheck
const User = require('../models/User');
const userRoles = require('./user-roles');

class UserService {
    static async getNonce(address) {
        let user = await User.findOne({address});
        return user.nonce;
    }

    static async getUser(address) {
        return await User.findOne({address});
    }

    static async createUser(address, nonce) {
        const user = new User({
            address,
            nonce,
            role: userRoles.USER,
        });

        await user.save();
    }

    static async setUserToAdmin(address) {
        return await User.findOneAndUpdate({address: address}, {role: userRoles.ADMIN}, {new: true, upsert: true});
    }

    static async preserveNonce(address, nonce) {
        const user = await User.findOne({address: address});

        if (!user) {
            return await UserService.createUser(address, nonce);
        }

        await User.findOneAndUpdate(
            {address: address},
            {
                address,
                nonce,
            },
            {new: true, upsert: true}
        );
    }
}

module.exports = UserService;
