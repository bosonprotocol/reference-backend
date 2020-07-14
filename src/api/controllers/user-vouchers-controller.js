//@ts-nocheck

const mongooseService = require('../../database/index.js')
const APIError = require('../api-error')

class UserVoucherController {
    
    static async getMyVouchers(req, res, next) {
        const voucherData = []
        const address = req.params.address.toLowerCase();
        
        const userVouchersDocuments = await mongooseService.getMyVouchers(address)

        const promises = []
        userVouchersDocuments.forEach(e => {
            promises.push(mongooseService.getVouchersDetails(e, voucherData))
        })

        await Promise.all(promises)

        res.status(200).send({ voucherData })
    }

    static async getVoucherDetails(req, res, next) {
        const myVoucherID = req.params.voucherID
        
        const myVoucherDocument = await mongooseService.getMyVoucherByID(myVoucherID)
        const voucherDetailsDocument = await mongooseService.getVoucher(myVoucherDocument.voucherID)

        const voucher = {
            _id: myVoucherDocument.id,
            _tokenIdVoucher: myVoucherDocument._tokenIdVoucher,
            _holder: myVoucherDocument._holder,
            _tokenIdSupply: myVoucherDocument._tokenIdSupply,
            buyerStatus: myVoucherDocument.status,
            voucherID: voucherDetailsDocument.id,
            voucherStatus: voucherDetailsDocument.status,
            title: voucherDetailsDocument.title,
            qty: voucherDetailsDocument.qty,
            description: voucherDetailsDocument.description,
            imagefiles: voucherDetailsDocument.imagefiles,
            category: voucherDetailsDocument.category,
            startDate: voucherDetailsDocument.startDate,
            expiryDate: voucherDetailsDocument.expiryDate,
            price: voucherDetailsDocument.price,
            buyerDeposit: voucherDetailsDocument.buyerDeposit,
            sellerDeposit: voucherDetailsDocument.sellerDeposit,
            voucherOwner: voucherDetailsDocument.voucherOwner,
        }

        res.status(200).send({ voucher })
    } 
}

module.exports = UserVoucherController;