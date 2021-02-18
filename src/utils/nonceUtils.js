const MAX_NONCE = 1000000;

class NonceUtils {
    static generateRandomNumber() {
        return Math.floor(Math.random() * Math.floor(MAX_NONCE));
    }
}

module.exports = NonceUtils;
