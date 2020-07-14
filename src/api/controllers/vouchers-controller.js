const mongooseService = require('../../database/index.js')
const AuthValidator = require('../services/auth-service')
const APIError = require('../api-error')
const voucherUtils = require('../../utils/voucherUtils')

class VouchersController {

    static async getVoucher(req, res, next) {
        let voucher;

        if (typeof req.params.id === 'undefined') {
            console.error(`An error occurred while tried to fetch Voucher.`);
            return next(new APIError(400, 'No VoucherID was presented'));
        }

        try {
            voucher = await mongooseService.getVoucher(req.params.id)
        } catch (error) {
            return next(new APIError(400, `${error.message}`));
        }

        res.status(200).send({
            voucher
        });
    }

    static async getSellVouchers(req, res, next) {
        let vouchers;
        const owner = req.params.address.toLowerCase();
        
        try {
            vouchers = await mongooseService.getVouchersByOwner(owner)
        } catch (error) {
            console.error(`An error occurred while user [${owner}] tried to fetch Vouchers.`);
            return next(new APIError(400, 'Invalid operation'));
        }

        res.status(200).send({ vouchers });
    }

    static async getBuyVouchers(req, res, next) {
        let vouchers;
        const buyer = req.params.address.toLowerCase();
        
        try {
            vouchers = await mongooseService.getVouchersByBuyer(buyer)
        } catch (error) {
            console.error(`An error occurred while user [${buyer}] tried to fetch Vouchers.`);
            return next(new APIError(400, 'Invalid operation'));
        }

        res.status(200).send({ vouchers });
    }

    static async createVoucher(req, res, next) {
        const fileRefs = await voucherUtils.uploadFiles(req);

        try {
            await mongooseService.createVoucher(req.body, fileRefs)
        } catch (error) {
            console.error(`An error occurred while user [${req.body.voucherOwner}] tried to create Voucher.`);
            return next(new APIError(400, 'Invalid voucher model'));
        }
    
        res.status(200).send({ success: true });
    }

    static async updateVoucher(req, res, next) {
        const fileRefs = await voucherUtils.uploadFiles(req);

        try {
            await mongooseService.updateVoucher(req.params.id, req.body, fileRefs)
        } catch (error) {
            console.error(`An error occurred while user [${req.body.voucherOwner}] tried to update Voucher.`);
            return next(new APIError(400, 'Invalid voucher model'));
        }

        res.status(200).send({ success: true });
    }

    static async deleteVoucher(req, res, next) {

        try {
            //TODO validate voucher exists
            await mongooseService.deleteVoucher(req.params.id);
        } catch (error) {
            console.error(`An error occurred while user [${req.body.voucherOwner}] tried to delete Voucher.`);
            return next(new APIError(400, 'Invalid operation'));
        }

        res.status(200).send({ success: true });
    }

    static async deleteImage(req, res, next) {
        const imageUrl = req.query.imageUrl;
        
        try {
            //TODO validate voucher exists
            await mongooseService.deleteImage(req.params.id, imageUrl);
        } catch (error) {
            console.error(`An error occurred while image frpm document [${req.params.id}] was tried to be deleted.`);
            return next(new APIError(400, 'Invalid operation'));
        }

        res.status(200).send({ success: true });
    }


    static async buy(req, res, next) {
        
        await mongooseService.buy();
        res.status(200).send({ success: true });
    }
}

module.exports = VouchersController;