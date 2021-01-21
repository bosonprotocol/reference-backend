const { mongo } = require('mongoose');
const mongooseService = require('../../database/index.js')
const APIError = require('../api-error')
const ethers = require('ethers');

const actors = {
    BUYER: 'buyer',
    SELLER: 'seller',
    ESCROW: 'escrow'
}

class PaymentController {

    static async getPaymentActors(req, res, next) {
        const objectId = req.params.voucherID

        const distributedAmounts = {
            payment: {
                buyer: ethers.BigNumber.from(0),
                seller: ethers.BigNumber.from(0),
                escrow: ethers.BigNumber.from(0)
            },
            sellerDeposit: {
                buyer: ethers.BigNumber.from(0),
                seller: ethers.BigNumber.from(0),
                escrow: ethers.BigNumber.from(0)
            },
            buyerDeposit: {
                buyer: ethers.BigNumber.from(0),
                seller: ethers.BigNumber.from(0),
                escrow: ethers.BigNumber.from(0)
            }
        }

        try {
            const userVoucher = await mongooseService.getMyVoucherByID(objectId)
            const buyer = userVoucher._holder;
            const seller = userVoucher.voucherOwner // TODO this must come from the voucher, not voucher owner as, the voucher might be transferred and we do not want to update every single possible userVoucher with the newly owner from that supply
            const payments = await mongooseService.getPaymentsByVoucherID(userVoucher._tokenIdVoucher);

            for (const key in payments) {
                if (payments[key]._to.toLowerCase() == buyer) {
                    PaymentController.addPayment(payments[key], actors.BUYER, distributedAmounts)
                } else if (payments[key]._to.toLowerCase() == seller) {
                    PaymentController.addPayment(payments[key], actors.SELLER, distributedAmounts)
                } else {
                    PaymentController.addPayment(payments[key], actors.ESCROW, distributedAmounts)
                }
            }

        } catch (error) {
            console.error(error)
            return next(new APIError(400, `Get payment actors for voucher id: ${ userVoucher._tokenIdVoucher } could not be completed.`))
        }

        res.status(200).send({ distributedAmounts });
    }

    static addPayment(paymentDetails, actor, distributedAmounts) {
        // _type:  0 - Payment, 1 - Seller Deposit, 2 - Buyer Deposit
        if (paymentDetails._type == 0) {
            distributedAmounts.payment[actor] = ethers.BigNumber.from(distributedAmounts.payment[actor].toString()).add(paymentDetails._payment.toString())
        } else if (paymentDetails._type == 1) {
            distributedAmounts.sellerDeposit[actor] = ethers.BigNumber.from(distributedAmounts.sellerDeposit[actor].toString()).add(paymentDetails._payment.toString())
        } else if (paymentDetails._type == 2){
            distributedAmounts.buyerDeposit[actor] = ethers.BigNumber.from(distributedAmounts.buyerDeposit[actor].toString()).add(paymentDetails._payment.toString())
        }
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

module.exports = PaymentController;
