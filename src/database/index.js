const VoucherSupply = require('./VoucherSupply/voucherSupply')
const User = require('./User/user')
const Voucher = require('./Voucher/voucher')
const Payment = require('./Payment/payment')

const MongooseService = {
    getNonce: User.getNonce,
    preserveNonce: User.preserveNonce,
    getUser: User.getUser,
    makeAdmin: User.setUserToAdmin,
    getVoucherSupply: VoucherSupply.getVoucherSupply,
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
    getAllVouchers: Voucher.getAllVouchers
}

module.exports = MongooseService;
