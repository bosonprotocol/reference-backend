const VoucherSupply = require('./VoucherSupply/VoucherSupply')
const User = require('./User/user')
const UserVoucher = require('./UserVoucher/userVoucher')
const Payment = require('./Payment/payment')

const MongooseService = {
    getNonce: User.getNonce,
    preserveNonce: User.preserveNonce,
    getUser: User.getUser,
    makeAdmin: User.setUserToAdmin,
    getVoucherSupply: VoucherSupply.getVoucherSupply,
    getVouchersByOwner: VoucherSupply.getVouchersByOwner,
    getVouchersByBuyer: VoucherSupply.getVouchersByBuyer,
    createVoucherSupply: VoucherSupply.createVoucherSupply,
    updateVoucherSupply: VoucherSupply.updateVoucherSupply,
    updateVoucherQty: VoucherSupply.updateVoucherQty,
    updateVoucherVisibilityStatus: VoucherSupply.updateVoucherVisibilityStatus,
    deleteVoucherSupply: VoucherSupply.deleteVoucherSupply,
    deleteImage: VoucherSupply.deleteImage,
    getVouchersDetails: VoucherSupply.getVouchersDetails,
    getActiveSupplies: VoucherSupply.getActiveSupplies,
    getInactiveSupplies: VoucherSupply.getInactiveSupplies,
    findUserVoucherById: UserVoucher.findUserVoucherById,
    createUserVoucher: UserVoucher.createUserVoucher,
    getMyVouchers: UserVoucher.getMyVouchers,
    getMyVoucherByID: UserVoucher.getMyVoucherByID,
    updateMyVoucherStatus: UserVoucher.updateMyVoucherStatus,
    findAllUsersByVoucherID: UserVoucher.findAllUsersByVoucherID,
    finalizeVoucher: UserVoucher.finalizeVoucher,
    createPayment: Payment.createPayment,
    getPaymentsByVoucherID: Payment.getPaymentsByVoucherID,
    getAllVouchers: UserVoucher.getAllVouchers
}

module.exports = MongooseService;
