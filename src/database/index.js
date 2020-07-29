const Product = require('./Product/product')
const Voucher = require('./Voucher/voucher')
const User = require('./User/user')
const UserVoucher = require('./UserVoucher/userVoucher')

const MongooseService = {
    createProduct: Product.createProduct,
    getNonce: User.getNonce,
    preserveNonce: User.preserveNonce,
    isUserRegistered: User.isUserRegistered,
    updateUserCollection: User.updateUserCollection,
    getVoucher: Voucher.getVoucher,
    getVouchersByOwner: Voucher.getVouchersByOwner,
    getVouchersByBuyer: Voucher.getVouchersByBuyer,
    createVoucher: Voucher.createVoucher,
    updateVoucher: Voucher.updateVoucher,
    updateVoucherQty: Voucher.updateVoucherQty,
    deleteVoucher: Voucher.deleteVoucher,
    deleteImage: Voucher.deleteImage,
    getVouchersDetails: Voucher.getVouchersDetails,
    getActiveVouchers: Voucher.getActiveVouchers,
    getInactiveVouchers: Voucher.getInactiveVouchers,
    findUserVoucherById: UserVoucher.findUserVoucherById,
    createUserVoucher: UserVoucher.createUserVoucher,
    getMyVouchers: UserVoucher.getMyVouchers,
    getMyVoucherByID: UserVoucher.getMyVoucherByID,
    updateMyVoucherStatus: UserVoucher.updateMyVoucherStatus,
    findAllUsersByVoucherID: UserVoucher.findAllUsersByVoucherID

}

module.exports = MongooseService;