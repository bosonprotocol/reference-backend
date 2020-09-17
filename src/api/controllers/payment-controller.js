const { mongo } = require('mongoose');
const mongooseService = require('../../database/index.js')
const APIError = require('../api-error')

class UserController {

    static async getPaymentActors(req, res, next) {
        const objectId = req.params.voucherID
        

        let actors = {
            buyer: 0,
            seller: 0,
            escrow: 0
        }

        try {
            const userVoucher = await mongooseService.getMyVoucherByID(objectId)
            const buyer = userVoucher._holder;
            const seller = userVoucher.voucherOwner
            const payments = await mongooseService.getPaymentsByVoucherID(userVoucher._tokenIdVoucher);

            for (const key in payments) {
                if (payments[key]._payee.toLowerCase() == buyer) {
                    actors.buyer = payments[key]._payment
                } else if (payments[key]._payee.toLowerCase() == seller) {
                    actors.seller = payments[key]._payment
                } else {
                    actors.escrow = payments[key]._payment
                }
            }

        } catch (error) {
            console.error(error)
            return next(new APIError(400, `Get payment actors for voucher id: ${_tokenIdVoucher} could not be completed.`))
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
            return next(new APIError(400, `Create payment operation for voucher id: ${events[0]._tokenIdVoucher} could not be completed.`))
        }

        res.status(200).send({ updated: true });
    }

}

module.exports = UserController;