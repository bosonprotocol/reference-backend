//@ts-nocheck

const mongooseService = require('../../database/index.js')
const APIError = require('../api-error')
const voucherUtils = require('../../utils/voucherUtils')
const statuses = require('../../utils/userVoucherStatus');

class UserVoucherController {

    static async commitToBuy(req, res, next) {
        const voucherID = req.params.voucherID //dbID
        const metadata = req.body;
        let userVoucher;
        
        try {
            userVoucher = await mongooseService.createUserVoucher(metadata, voucherID);
        } catch (error) {
            console.error(error)
            return next(new APIError(400, `Buy operation for voucher id: ${metadata.voucherID} could not be completed.`))
        }

        res.status(200).send({ userVoucherID: userVoucher.id});
    }

    /**
     * @notice This function is triggered while event 'LogVoucherDelivered' is emitted
     */
    static async updateVoucherDelivered(req, res, next) {
        let userVoucher;

        try {
            userVoucher = await mongooseService.updateVoucherDelivered(req.body);

            //TODO This function might not be necessary
            await mongooseService.updateSupplyQty(userVoucher.voucherID);

        } catch (error) {
            console.error(error)
            return next(new APIError(400, `Updated operation for voucher id: ${metadata.voucherID} could not be completed.`))
        }

        res.status(200).send({ userVoucherID: userVoucher.id});
    }

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

    static async getBuyersByVoucherID(req, res, next) {
        const owner = res.locals.address
        const voucherID = req.params.voucherID
        let vouchers = {};
        try {
            vouchers = await mongooseService.findAllUsersByVoucherID(voucherID, owner)
        } catch (error) {
            console.error(error.message);

        }
        res.status(200).send({vouchers});
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
            CANCELLED: myVoucherDocument.CANCELLED,
            COMMITTED: myVoucherDocument.COMMITTED,
            COMPLAINED: myVoucherDocument.COMPLAINED,
            REDEEMED: myVoucherDocument.REDEEMED,
            REFUNDED: myVoucherDocument.REFUNDED,
            FINALIZED: myVoucherDocument.FINALIZED,
            voucherID: voucherDetailsDocument.id,
            voucherStatus: voucherUtils.calcVoucherStatus(voucherDetailsDocument.startDate, voucherDetailsDocument.expiryDate, voucherDetailsDocument.qty),
            title: voucherDetailsDocument.title,
            qty: voucherDetailsDocument.qty,
            description: voucherDetailsDocument.description,
            location: voucherDetailsDocument.location,
            contact: voucherDetailsDocument.contact,
            conditions: voucherDetailsDocument.conditions,
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

     /**
     * @notice This function is triggered while some of the following events is emitted
     *  LogVoucherRedeemed
     *  LogVoucherRefunded
     *  LogVoucherComplain
     *  LogVoucherFaultCancel
     *  Transfer (e.g ERC-721)
     */
    static async updateMyVoucherOnCommonEvent(req, res, next) {
        let userVoucher

        try {
            const userVoucher = await mongooseService.findUserVoucherByTokenIdVoucher(req.body._tokenIdVoucher)
            
            if (!userVoucher) { 
                return next(new APIError(404, `User Voucher with voucherTokenId ${req.body._tokenIdVoucher} not found!`))
            }
            
            await mongooseService.updateMyVoucherOnCommonEvent(userVoucher.id, req.body)
        } catch (error) {
            console.error(error)
            return next(new APIError(400, `Update operation for user voucher id: ${userVoucher.id} could not be completed.`))
        }

        res.status(200).send({ updated: true })
    }

    static async finalizeVoucher(req, res, next) {
        const tokenIdVoucher = req.body[0]._tokenIdVoucher;
        const status = req.body[0].status

        try {
            await mongooseService.finalizeVoucher(tokenIdVoucher, status)
        } catch (error) {
            console.error(error)
            return next(new APIError(400, `Finalize operation for token voucher id: ${userVoucherID} could not be completed.`))
        }

        res.status(200).send({ updated: true })
    }

    static async getAllVouchers(req, res, next) {
        const vouchersDocuments = await mongooseService.getAllVouchers();

        res.status(200).send({ vouchersDocuments })
    }

}

module.exports = UserVoucherController;
