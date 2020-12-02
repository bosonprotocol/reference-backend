//@ts-nocheck

const mongooseService = require('../../database/index.js')
const APIError = require('../api-error')
const ethers = require('ethers');;
const provider = new ethers.providers.JsonRpcProvider();
const constants = require('../../utils/testUtils/constants')
const sellerWallet = new ethers.Wallet(constants.SELLER_PK, provider);
const Cashier = require('../../utils/testUtils/ABIS/Cashier.json')
const TestUtils = require('../../utils/testUtils/testUtils');
const utils = new TestUtils(provider);

class TestController {

    static async createVoucher(req, res, next) {
        const voucherOwner = sellerWallet.address;
        const timestamp = await utils.getCurrTimestamp();

        req.body.startDate = timestamp  * 1000
        req.body.expiryDate = (timestamp + 2 * constants.SECONDS_IN_DAY) * 1000
        req.body.offeredDate = Date.now()
        req.body.location = 'test'
        req.body.contact = 'test'
        req.body.conditions = 'test'

        const tx = await TestController.createVoucherBatch(req.body);
        const receipt = await tx.wait();
        let parsedEvent = await utils.findEventByName(receipt, 'LogOrderCreated', '_tokenIdSupply', '_seller', '_quantity')

        let batch
        try {
            batch = await mongooseService.createVoucher({
                ...req.body,
                ...parsedEvent
            }, [], voucherOwner)
        } catch (error) {
            console.error(`An error occurred while user [${voucherOwner}] tried to create Voucher.`);
            console.error(error)
            return next(new APIError(400, 'Invalid voucher model'));
        }

        res.status(200).send({batch});
    }

    static async buy(req, res, next) {

        await mongooseService.buy();
        res.status(200).send({ success: true });
    }

    static async createVoucherBatch(body) {
        let cashierContractSeller = new ethers.Contract(constants.CashierContractAddress, Cashier.abi, sellerWallet)
        let dataArr = [
            body.startDate,
            body.expiryDate,
            body.price,
            body.sellerDeposit,
            body.buyerDeposit,
            body.qty
        ]

        const txValue = ethers.BigNumber.from(body.sellerDeposit).mul(body.qty)
        return await cashierContractSeller.requestCreateOrder_ETH_ETH(
            dataArr,
            { value: txValue }
        );
    }

}

module.exports = TestController;