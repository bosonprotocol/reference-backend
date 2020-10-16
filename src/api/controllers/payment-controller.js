const { mongo } = require('mongoose');
const mongooseService = require('../../database/index.js')
const APIError = require('../api-error')
const ethers = require('ethers');

class UserController {

    static async getPaymentActors(req, res, next) {
        const objectId = req.params.voucherID

        let buyerAmount = ethers.BigNumber.from(0);
        let sellerAmount = ethers.BigNumber.from(0);
        let escrowAmount = ethers.BigNumber.from(0);

        try {
            const userVoucher = await mongooseService.getMyVoucherByID(objectId)
            const buyer = userVoucher._holder;
            const seller = userVoucher.voucherOwner
            const payments = await mongooseService.getPaymentsByVoucherID(userVoucher._tokenIdVoucher);

            for (const key in payments) {
                if (payments[key]._payee.toLowerCase() == buyer) {
                    buyerAmount = ethers.BigNumber.from(buyerAmount.toString()).add(payments[key]._payment.toString())
                } else if (payments[key]._payee.toLowerCase() == seller) {
                    sellerAmount = ethers.BigNumber.from(sellerAmount.toString()).add(payments[key]._payment.toString())
                } else {
                    escrowAmount = ethers.BigNumber.from(escrowAmount.toString()).add(payments[key]._payment.toString())
                }
            }

        } catch (error) {
            console.error(error)
            return next(new APIError(400, `Get payment actors for voucher id: ${ userVoucher._tokenIdVoucher } could not be completed.`))
        }

        const actors = {
            buyer: buyerAmount.toString(),
            seller: sellerAmount.toString(),
            escrow: escrowAmount.toString(),
        }

        res.status(200).send({ actors });
    }

    static async createPayments(req, res, next) {
        const events = res.locals.events
        let promises = []

        try {
            for (const key in events) {
                promises.push(mongooseService.createPayment(events[key]))
            }

            await Promise.all(promises)

        } catch (error) {
            console.error(error)
            return next(new APIError(400, `Create payment operation for voucher id: ${ events[0]._tokenIdVoucher } could not be completed.`))
        }

        res.status(200).send({ updated: true });
    }

    static async getPaymentsByVoucherID(req, res, next) {
        const tokenIdVoucher = req.params.tokenIdVoucher;

        const payments = await mongooseService.getPaymentsByVoucherID(tokenIdVoucher);

        res.status(200).send({ payments })
    }

}

module.exports = UserController;
