//@ts-nocheck

const mongooseService = require('../../database/index.js')
const APIError = require('../api-error')
const voucherUtils = require('../../utils/voucherUtils')
const statuses = require('../../utils/userVoucherStatus');

class UserVoucherController {
    
    static async getMyVouchers(req, res, next) {
        const voucherData = []
        const address = res.locals.address;
        
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
            voucherStatus: voucherUtils.calcVoucherStatus(voucherDetailsDocument.startDate, voucherDetailsDocument.expiryDate, voucherDetailsDocument.qty),
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

    static async updateMyVoucher(req, res, next) {
        const userVoucherID = res.locals.userVoucher.id;
        const status = req.body.status
        
        try {
            const myVoucherDocument = await mongooseService.updateMyVoucherStatus(userVoucherID, status)
        } catch (error) {
            console.error(error)
            return next(new APIError(400, `Redeem operation for user voucher id: ${userVoucherID} could not be completed.`))
        }

        res.status(200).send({ updated: true })
    }
}

module.exports = UserVoucherController;