const Product = require('./Product/product')
const Voucher = require('./Voucher/voucher')
const User = require('./User/user')
const UserVoucher = require('./UserVoucher/userVoucher')

const MongooseService = {
    createProduct: Product.createProduct,
    getNonce: User.getNonce,
    preserveNonce: User.preserveNonce,
    commitToBuy: User.commitToBuy,
    getVoucher: Voucher.getVoucher,
    getVouchersByOwner: Voucher.getVouchersByOwner,
    getVouchersByBuyer: Voucher.getVouchersByBuyer,
    createVoucher: Voucher.createVoucher,
    updateVoucher: Voucher.updateVoucher,
    deleteVoucher: Voucher.deleteVoucher,
    deleteImage: Voucher.deleteImage,
    getVouchersDetails: Voucher.getVouchersDetails,
    createUserVoucher: UserVoucher.createUserVoucher,
    getMyVouchers: UserVoucher.getMyVouchers,
    getMyVoucherByID: UserVoucher.getMyVoucherByID,

}

module.exports = MongooseService;