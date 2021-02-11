const VoucherSupply = require('./VoucherSupply/VoucherSupply')
const User = require('./User/user')
const Voucher = require('./Voucher/voucher')
const Payment = require('./Payment/payment')

const MongooseService = {
    getNonce: User.getNonce,
    preserveNonce: User.preserveNonce,
    getUser: User.getUser,
    makeAdmin: User.setUserToAdmin,
    getVoucherSupply: VoucherSupply.getVoucherSupply,
    getAllVoucherSupplies: VoucherSupply.getAllVoucherSupplies,
    getVoucherSupplyBySupplyID: VoucherSupply.getVoucherSupplyBySupplyID,
    getVoucherSuppliesByOwner: VoucherSupply.getVoucherSuppliesByOwner,
    getVoucherSuppliesByBuyer: VoucherSupply.getVoucherSuppliesByBuyer,
    createVoucherSupply: VoucherSupply.createVoucherSupply,
    setVoucherSupplyMeta: VoucherSupply.setVoucherSupplyMeta,
    updateSupplyMeta: VoucherSupply.updateSupplyMeta,
    updateVoucherSupply: VoucherSupply.updateVoucherSupply,
    updateSupplyQty: VoucherSupply.updateSupplyQty,
    updateVoucherVisibilityStatus: VoucherSupply.updateVoucherVisibilityStatus,
    deleteVoucherSupply: VoucherSupply.deleteVoucherSupply,
    deleteImage: VoucherSupply.deleteImage,
    getVouchersSupplyDetails: VoucherSupply.getVouchersSupplyDetails,
    getActiveSupplies: VoucherSupply.getActiveSupplies,
    getInactiveSupplies: VoucherSupply.getInactiveSupplies,
    findVoucherById: Voucher.findVoucherById,
    findVoucherByTokenIdVoucher: Voucher.findVoucherByTokenIdVoucher,
    createVoucher: Voucher.createVoucher,
    updateVoucherDelivered: Voucher.updateVoucherDelivered,
    getUserVouchers: Voucher.getUserVouchers,
    getVoucherByID: Voucher.getVoucherByID,
    updateVoucherOnCommonEvent: Voucher.updateVoucherOnCommonEvent,
    findAllVouchersByVoucherSupplyID: Voucher.findAllVouchersByVoucherSupplyID,
    finalizeVoucher: Voucher.finalizeVoucher,
    createPayment: Payment.createPayment,
    getPaymentsByVoucherID: Payment.getPaymentsByVoucherID,
    getAllVouchers: Voucher.getAllVouchers
}

module.exports = MongooseService;
