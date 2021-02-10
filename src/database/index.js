const Payment = require("./Payment/payment");

const MongooseService = {
  createPayment: Payment.createPayment,
  getPaymentsByVoucherID: Payment.getPaymentsByVoucherID,
};

module.exports = MongooseService;
