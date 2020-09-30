// @ts-nocheck
const Payment = require('../models/Payment')

class PaymentService {

    static async createPayment(metadata) {

        const payment = new Payment({
            _tokenIdVoucher: metadata._tokenIdVoucher,
            _payee: metadata._payee,
            _payment: metadata._payment,
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
