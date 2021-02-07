const Voucher = require("./Voucher/voucher");
const Payment = require("./Payment/payment");

const MongooseService = {
  findVoucherById: Voucher.findVoucherById,
  findVoucherByTokenIdVoucher: Voucher.findVoucherByTokenIdVoucher,
  createVoucher: Voucher.createVoucher,
  updateVoucherStatus: Voucher.updateVoucherStatus,
  updateVoucherDelivered: Voucher.updateVoucherDelivered,
  getUserVouchers: Voucher.getUserVouchers,
  getVoucherByID: Voucher.getVoucherByID,
  updateVoucherOnCommonEvent: Voucher.updateVoucherOnCommonEvent,
  findAllVouchersByVoucherSupplyID: Voucher.findAllVouchersByVoucherSupplyID,
  updateStatusFromKeepers: Voucher.updateStatusFromKeepers,
  createPayment: Payment.createPayment,
  getPaymentsByVoucherID: Payment.getPaymentsByVoucherID,
  getAllVouchers: Voucher.getAllVouchers,
};

module.exports = MongooseService;
