class Authorization {

    static async authorize(req, res, next) {
        next();
    }

}

module.exports = Authorization;