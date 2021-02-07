const Voucher = require("./Voucher/voucher");
const Payment = require("./Payment/payment");

const MongooseService = {
  findVoucherById: Voucher.findVoucherById,
  findVoucherByTokenIdVoucher: Voucher.findVoucherByTokenIdVoucher,
  createVoucher: Voucher.createVoucher,
  getUserVouchers: Voucher.getUserVouchers,
  getVoucherByID: Voucher.getVoucherByID,
  updateVoucherStatus: Voucher.updateVoucherStatus,
  findAllVouchersByVoucherSupplyID: Voucher.findAllVouchersByVoucherSupplyID,
  finalizeVoucher: Voucher.finalizeVoucher,
  createPayment: Payment.createPayment,
  getPaymentsByVoucherID: Payment.getPaymentsByVoucherID,
  getAllVouchers: Voucher.getAllVouchers,
};

module.exports = MongooseService;
