// @ts-nocheck
const Payment = require("../models/Payment");

class PaymentsRepository {
  async createPayment(metadata) {
    const payment = new Payment({
      _tokenIdVoucher: metadata._tokenIdVoucher,
      _to: metadata._to,
      _payment: metadata._payment,
      _type: metadata._type,
      txHash: metadata.txHash,
    });

    await payment.save();
  }

  async getPaymentsByVoucherTokenId(voucherTokenId) {
    return Payment.where("_tokenIdVoucher").equals(voucherTokenId);
  }
}

module.exports = PaymentsRepository;
