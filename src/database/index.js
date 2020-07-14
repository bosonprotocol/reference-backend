const Product = require('./Product/product')
const Voucher = require('./Voucher/voucher')
const User = require('./User/user')
const UserVoucher = require('./UserVoucher/userVoucher')

const MongooseService = {
    createProduct: Product.createProduct,
    getNonce: User.getNonce,
    preserveNonce: User.preserveNonce,
    isUserRegistered: User.isUserRegistered,
    commitToBuy: User.commitToBuy,
    getVoucher: Voucher.getVoucher,
    getVouchersByOwner: Voucher.getVouchersByOwner,
    getVouchersByBuyer: Voucher.getVouchersByBuyer,
    createVoucher: Voucher.createVoucher,
    updateVoucher: Voucher.updateVoucher,
    updateVoucherQty: Voucher.updateVoucherQty,
    deleteVoucher: Voucher.deleteVoucher,
    deleteImage: Voucher.deleteImage,
    getVouchersDetails: Voucher.getVouchersDetails,
    createUserVoucher: UserVoucher.createUserVoucher,
    getMyVouchers: UserVoucher.getMyVouchers,
    getMyVoucherByID: UserVoucher.getMyVoucherByID,
    updateMyVoucherStatus: UserVoucher.updateMyVoucherStatus

}

module.exports = MongooseService;