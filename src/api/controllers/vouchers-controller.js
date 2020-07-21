//@ts-nocheck

const mongooseService = require('../../database/index.js')
const AuthValidator = require('../services/auth-service')
const APIError = require('../api-error')
const voucherUtils = require('../../utils/voucherUtils');

class VouchersController {

    static async getVoucher(req, res, next) {
        let voucher;

        if (typeof req.params.id === 'undefined') {
            console.error(`An error occurred while tried to fetch Voucher.`);
            return next(new APIError(400, 'No VoucherID was presented'));
        }

        try {
            voucher = await mongooseService.getVoucher(req.params.id)
           
            const voucherStatus = voucherUtils.calcVoucherStatus(voucher.startDate, voucher.expiryDate, voucher.qty )
            voucher.voucherStatus = voucherStatus
        } catch (error) {
            console.error(error)
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
            console.error(error)
            return next(new APIError(400, 'Invalid operation'));
        }

        res.status(200).send({ vouchers });
    }

    static async getVouchersStatus(req, res, next) {
        let active, inactive = [];
        const address = res.locals.address;

        try {
            active = await mongooseService.getActiveVouchers(address)
            inactive = await mongooseService.getInactiveVouchers(address)
        } catch (error) {
            return next(new APIError(400, 'Bad request.'));
        }

        res.status(200).send({ active: active.length, inactive: inactive.length });
    }

    static async createVoucher(req, res, next) {
        const fileRefs = await voucherUtils.uploadFiles(req);
        const voucherOwner = res.locals.address;
        
        try {
            await mongooseService.createVoucher(req.body, fileRefs, voucherOwner)
        } catch (error) {
            console.error(`An error occurred while user [${voucherOwner}] tried to create Voucher.`);
            console.error(error)
            return next(new APIError(400, 'Invalid voucher model'));
        }
    
        res.status(200).send({ success: true });
    }

    static async updateVoucher(req, res, next) {
        const fileRefs = await voucherUtils.uploadFiles(req);
        const voucherOwner = res.locals.address;
        const voucher = res.locals.voucher
        
        try {
            await mongooseService.updateVoucher(voucher, req.body, fileRefs)
        } catch (error) {
            console.error(`An error occurred while user [${voucherOwner}] tried to update Voucher.`);
            console.error(error)
            return next(new APIError(400, 'Invalid voucher model'));
        }

        res.status(200).send({ success: true });
    }

    static async deleteVoucher(req, res, next) {
        const voucher = res.locals.voucher

        try {
            await mongooseService.deleteVoucher(voucher.id);
        } catch (error) {
            console.error(`An error occurred while user [${req.body.voucherOwner}] tried to delete Voucher.`);
            return next(new APIError(400, 'Invalid operation'));
        }

        res.status(200).send({ success: true });
    }

    static async deleteImage(req, res, next) {
        const voucher = res.locals.voucher
        const imageUrl = req.query.imageUrl;
        
        try {
            //TODO validate voucher exists
            await mongooseService.deleteImage(voucher.id, imageUrl);
        } catch (error) {
            console.error(`An error occurred while image frpm document [${req.params.id}] was tried to be deleted.`);
            console.error(error)
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