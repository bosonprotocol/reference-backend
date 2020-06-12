class Authorization {

    static async authorize(req, res, next) {

        console.log('here should be the jwt');
        
        res.status(200)
    }

}

module.exports = Authorization;