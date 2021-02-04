const VoucherSupply = require("./VoucherSupply/VoucherSupply");
const Voucher = require("./Voucher/voucher");
const Payment = require("./Payment/payment");

const MongooseService = {
  getVoucherSupply: VoucherSupply.getVoucherSupply,
  getAllVoucherSupplies: VoucherSupply.getAllVoucherSupplies,
  getVoucherSupplyBySupplyID: VoucherSupply.getVoucherSupplyBySupplyID,
  getVoucherSuppliesByOwner: VoucherSupply.getVoucherSuppliesByOwner,
  getVoucherSuppliesByBuyer: VoucherSupply.getVoucherSuppliesByBuyer,
  createVoucherSupply: VoucherSupply.createVoucherSupply,
  updateVoucherSupply: VoucherSupply.updateVoucherSupply,
  updateVoucherQty: VoucherSupply.updateVoucherQty,
  updateVoucherVisibilityStatus: VoucherSupply.updateVoucherVisibilityStatus,
  deleteVoucherSupply: VoucherSupply.deleteVoucherSupply,
  deleteImage: VoucherSupply.deleteImage,
  getVouchersSupplyDetails: VoucherSupply.getVouchersSupplyDetails,
  getActiveSupplies: VoucherSupply.getActiveSupplies,
  getInactiveSupplies: VoucherSupply.getInactiveSupplies,
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
