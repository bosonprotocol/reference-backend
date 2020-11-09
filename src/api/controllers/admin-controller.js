const mongooseService = require('../../database/index.js');
const ApiError = require('../api-error');
const ethers = require('ethers')
class AdminController {

    static async changeTokenSupplyIDVisibility(req, res, next) {
        const voucherID = req.params.voucherID;
        let voucher;

        try {
            voucher = await mongooseService.getVoucher(voucherID)
        } catch (error) {
            return next(new ApiError(400, `Voucher with ID: ${voucherID} does not exist!`))
        }

        const updatedVoucher = await mongooseService.updateVoucherVisibilityStatus(voucher.id);
        res.status(200).send({ visible: updatedVoucher.visible });
    }

    static async makeAdmin(req, res, next) {
        const address = req.params.address.toLowerCase();
        
        if (!ethers.utils.isAddress(address)) {
            return next(new ApiError(400, `Provided address: ${address} is not a valid ETH address!`))
        }
        await mongooseService.makeAdmin(address);

        res.status(200).send({updated: true})
    }
}

module.exports = AdminController;
