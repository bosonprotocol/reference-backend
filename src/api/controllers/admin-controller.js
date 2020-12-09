const mongooseService = require('../../database/index.js');
const ApiError = require('../api-error');
const ethers = require('ethers')
class AdminController {

    static async changeVoucherSupplyVisibility(req, res, next) {
        const supplyID = req.params.supplyID;
        let voucherSupply;

        try {
            voucherSupply = await mongooseService.getVoucherSupply(supplyID)
        } catch (error) {
            console.error(error);
            return next(new ApiError(400, `Voucher with ID: ${supplyID} does not exist!`))
        }

        const updatedVoucherSupply = await mongooseService.updateVoucherVisibilityStatus(voucherSupply.id);
        res.status(200).send({ visible: updatedVoucherSupply.visible });
    }

    static async makeAdmin(req, res, next) {
        const address = req.params.address.toLowerCase();

        if (!ethers.utils.isAddress(address)) {
            return next(new ApiError(400, `Provided address: ${address} is not a valid ETH address!`))
        }

        try {
            const user = await mongooseService.getUser(address)

            if (!user) {
                return next(new ApiError(400, `Provided user does not exist in the DB!`))
            }

            await mongooseService.makeAdmin(address);

        } catch (error) {
            console.error(error);
            return next(new ApiError(400, `Provided address: ${address} was not set as admin!`))
        }

        res.status(200).send({updated: true})
    }
}

module.exports = AdminController;
