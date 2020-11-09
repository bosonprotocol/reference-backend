// @ts-nocheck
const Payment = require('../models/Payment')

class PaymentService {

    static async createPayment(metadata) {

        const payment = new Payment({
            _tokenIdVoucher: metadata._tokenIdVoucher,
            _to: metadata._to,
            _payment: metadata._payment,
            _type: metadata._type,
            txHash: metadata.txHash
        })

        await payment.save();
    }

    static async getPaymentsByVoucherID(_tokenIdVoucher) {
        return await Payment
            .where('_tokenIdVoucher').equals(_tokenIdVoucher)
    }

}

module.exports = PaymentService
