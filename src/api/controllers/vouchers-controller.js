const mongooseService = require('../../database/mongoose-service')
const AuthValidator = require('../services/auth-service')
const APIError = require('../api-error')
const voucherUtils = require('../../utils/voucherUtils')

class VouchersController {

    static async getVoucher(req, res, next) {
        let voucher;
        if (req.params.id === 'undefined') {
            console.error(`An error occurred while tried to fetch Voucher.`);
            return next(new APIError(400, 'No VoucherID was presented'));
        }

        try {
            voucher = await mongooseService.getVoucher(req.params.id)
        } catch (error) {
            console.log(error.message);
        }

        res.status(200).send({
            voucher
        });
    }

    static async createVoucher(req, res, next) {
        
        const fileRefs = await voucherUtils.uploadFiles(req);

        try {
            console.log(req.body);
            
            await mongooseService.createVoucher(req.body, fileRefs)
        } catch (error) {
            console.error(`An error occurred while user [${req.body.userAddress}] tried to create Voucher.`);
            return next(new APIError(400, 'Invalid voucher model'));
        }
    
        res.status(200).send();
    }

    static async updateVoucher(req, res, next) {

        try {
            await mongooseService.updateVoucher(req.params.id, req.body)
        } catch (error) {
            console.error(`An error occurred while user [${req.body.userAddress}] tried to update Voucher.`);
            return next(new APIError(400, 'Invalid voucher model'));
        }

        res.status(200).send();
    }

    static async deleteVoucher(req, res, next) {
        
        try {
            await mongooseService.deleteVoucher(req.params.id);
        } catch (error) {
            console.error(`An error occurred while user [${req.body.userAddress}] tried to delete Voucher.`);
            return next(new APIError(400, 'Invalid operation'));
        }

        res.status(200).send();
    }


    static async buy(req, res, next) {
        
        await mongooseService.buy();
        res.status(200).send();
    }
}

module.exports = VouchersController;