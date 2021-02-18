//@ts-nocheck

const mongooseService = require('../../database/index.js');
const APIError = require('../api-error');
const ethers = require('ethers');
const constants = require('../../utils/testUtils/constants');

const provider = new ethers.providers.InfuraProvider('rinkeby', [constants.INFURA_API_KEY]);

const sellerWallet = new ethers.Wallet(constants.SELLER_PK, provider);
const buyerWallet = new ethers.Wallet(constants.BUYER_PK, provider);
const Cashier = require('../../utils/testUtils/ABIS/Cashier.json');
const VoucherKernel = require('../../utils/testUtils/ABIS/VoucherKernel.json');
const TestUtils = require('../../utils/testUtils/testUtils');
const utils = new TestUtils(provider);

const {AbiCoder, Interface} = require('ethers').utils;

async function getEncodedTopic(receipt, abi, eventName) {
    const interface = new Interface(abi);
    for (const log in receipt.logs) {
        const topics = receipt.logs[log].topics;
        for (const index in topics) {
            const encodedTopic = topics[index];

            try {
                // CHECK IF  TOPIC CORRESPONDS TO THE EVENT GIVEN TO FN
                let event = await interface.getEvent(encodedTopic);

                if (event.name == eventName) return encodedTopic;
            } catch (error) {
                // breaks silently as we do not need to do anything if the there is not such an event
            }
        }
    }

    return '';
}

async function decodeData(receipt, encodedTopic, paramsArr) {
    const decoder = new AbiCoder();

    const encodedData = receipt.logs.filter((e) => e.topics.includes(encodedTopic))[0].data;
    return decoder.decode(paramsArr, encodedData);
}

class TestController {
    static async createVoucherSupply(req, res, next) {
        const voucherOwner = sellerWallet.address;
        let timestamp;

        let parsedEvent;
        let tx;
        let receipt;
        try {
            timestamp = await utils.getCurrTimestamp();

            req.body.startDate = (timestamp - 1 * constants.SECONDS_IN_DAY) * 1000;
            req.body.expiryDate = (timestamp + 2 * constants.SECONDS_IN_DAY) * 1000;
            req.body.offeredDate = Date.now();
            req.body.location = 'test';
            req.body.contact = 'test';
            req.body.conditions = 'test';

            tx = await TestController.createVoucherBatch(req.body);
            receipt = await tx.wait();

            parsedEvent = await utils.findEventByName(receipt, 'LogOrderCreated', '_tokenIdSupply', '_seller', '_quantity', '_paymentType');
        } catch (error) {
            console.error(error.error);
            return next(new APIError(400, `Transaction failed. TxHash: ${tx.hash} `));
        }

        try {
            await mongooseService.createVoucherSupply(
                {
                    ...req.body,
                    ...parsedEvent,
                },
                [],
                voucherOwner.toLowerCase()
            );
        } catch (error) {
            console.error(`An error occurred while user [${voucherOwner}] tried to create Voucher.`);
            console.error(error);
            return next(new APIError(400, 'Invalid voucher model'));
        }

        res.status(200).send({tokenSupplyID: parsedEvent._tokenIdSupply});
    }

    static async createVoucher(req, res, next) {
        let cashierContract_Buyer = new ethers.Contract(constants.CashierContractAddress, Cashier.abi, buyerWallet);
        const supplyID = req.params.supplyID;

        let data;

        const voucherSupply = await mongooseService.getVoucherSupplyBySupplyID(supplyID);

        const txValue = ethers.BigNumber.from(voucherSupply.price.toString()).add(voucherSupply.buyerDeposit.toString());
        let tx;
        let metadata = {};

        try {
            tx = await cashierContract_Buyer.requestVoucher_ETH_ETH(supplyID, voucherSupply.voucherOwner, {
                value: txValue.toString(),
                gasLimit: '6000000',
            });

            const receipt = await tx.wait();

            let encodedTopic = await getEncodedTopic(receipt, VoucherKernel.abi, 'LogVoucherDelivered');
            data = await decodeData(receipt, encodedTopic, ['uint256', 'address', 'address', 'bytes32']);
        } catch (error) {
            console.error(error);
            return next(new APIError(400, `Transaction failed! TxHash: ${tx.hash}`));
        }

        metadata = {
            txHash: tx.hash,
            _tokenIdSupply: supplyID,
            _tokenIdVoucher: data[0].toString(),
            _issuer: data[1],
            _holder: data[2],
        };

        try {
            await mongooseService.createVoucher(metadata, voucherSupply.id);
        } catch (error) {
            console.error(error);
            return next(new APIError(400, 'Failed to store voucher in DB'));
        }

        res.status(200).send({tokenIdVoucher: data[0].toString()});
    }

    static async redeem(req, res, next) {
        const voucherID = req.params.voucherID;
        const voucherKernel = new ethers.Contract(constants.VoucherKernelContractAddress, VoucherKernel.abi, buyerWallet);
        const voucher = await mongooseService.findVoucherByTokenIdVoucher(voucherID);
        let tx;
        try {
            tx = await voucherKernel.redeem(voucherID, {gasLimit: '4000000'});
            await tx.wait();
            await mongooseService.updateVoucherStatus(voucher.id, 'REDEEMED');
        } catch (error) {
            console.error(error);
            return next(new APIError(400, `Tx failed! TxHash: ${tx.hash}`));
        }

        res.status(200).send({sucess: true});
    }

    static async buy(req, res) {
        await mongooseService.buy();
        res.status(200).send({success: true});
    }

    static async createVoucherBatch(body) {
        let cashierContractSeller = new ethers.Contract(constants.CashierContractAddress, Cashier.abi, sellerWallet);
        const startDate = body.startDate / 1000;
        const endDate = body.expiryDate / 100;

        let dataArr = [startDate, endDate, body.price, body.sellerDeposit, body.buyerDeposit, body.qty];

        const txValue = ethers.BigNumber.from(body.sellerDeposit).mul(body.qty);
        return await cashierContractSeller.requestCreateOrder_ETH_ETH(dataArr, {
            value: txValue,
            gasLimit: '5000000',
        });
    }
}

module.exports = TestController;
