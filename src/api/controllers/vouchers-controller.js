const mongooseService = require('../../database/mongoose-service')
const AuthValidator = require('../services/auth-service')
const APIError = require('../api-error')
const voucherUtils = require('../../utils/voucherUtils')

class VouchersController {

    static async createVoucher(req, res, next) {
        //validate voucher
        
        const fileRefs = await voucherUtils.uploadFiles(req);

        console.log(req.body);
        console.log('======');
        console.log(fileRefs);
        

        try {
            await mongooseService.createVoucher(req.body, fileRefs)
        } catch (error) {
            console.error(`An error occurred while user [${req.body.userAddress}] tried to create Voucher.`);
            return next(new APIError(400, 'Invalid voucher model'));
        }
    
        res.status(200).send();
    }

    static async updateVoucher(req, res, next) {

        res.status(200).send();
    }

    static async deleteVoucher(req, res, next) {

        res.status(200).send();
    }


    static async buy(req, res, next) {
        
        await mongooseService.buy();
        res.status(200).send();
    }
}

module.exports = VouchersController;