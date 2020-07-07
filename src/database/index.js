// @ts-nocheck

const Product = require('./Product/product')
const Voucher = require('./Voucher/voucher')
const User = require('./User/user')

const MongooseService = {
    createProduct: Product.createProduct,
    getNonce: User.getNonce,
    preserveNonce: User.preserveNonce,
    getVoucher: Voucher.getVoucher,
    getVouchersByOwner: Voucher.getVouchersByOwner,
    getVouchersByBuyer: Voucher.getVouchersByBuyer,
    createVoucher: Voucher.createVoucher,
    updateVoucher: Voucher.updateVoucher,
    deleteVoucher: Voucher.deleteVoucher,
    deleteImage: Voucher.deleteImage,
}

module.exports = MongooseService;