const ethers = require('ethers');

const MAX_NONCE = 1000000

 class Utils {
    static generateRandomNumber() {
        return Math.floor(Math.random() * Math.floor(MAX_NONCE))
    }

    static hashMessage(msg) {
        return ethers.utils.hashMessage(msg)
    }

    static arrayify(msgHash) {
        return ethers.utils.arrayify(msgHash)
    }

     static recoverAddress(msgHashBytes, signature) {
        return ethers.utils.recoverAddress(msgHashBytes, signature)
    }
}

module.exports = Utils;