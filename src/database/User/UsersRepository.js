// @ts-nocheck
const User = require("../models/User");
const userRoles = require("./userRoles");

class UsersRepository {
  async getNonce(address) {
    const user = await User.findOne({ address });
    return user.nonce;
  }

  async getUser(address) {
    return User.findOne({ address });
  }

  async createUser(address, nonce) {
    const user = new User({
      address,
      nonce,
      role: userRoles.USER,
    });

    await user.save();
  }

  async setUserToAdmin(address) {
    return User.findOneAndUpdate(
      { address: address },
      { role: userRoles.ADMIN },
      { new: true, upsert: true }
    );
  }

  async preserveNonce(address, nonce) {
    const user = await User.findOne({ address: address });

    if (!user) {
      return this.createUser(address, nonce);
    }

    await User.findOneAndUpdate(
      { address: address },
      {
        address,
        nonce,
      },
      { new: true, upsert: true }
    );
  }
}

module.exports = UsersRepository;
