/* eslint-disable no-console */
const functions = require('firebase-functions');
const axios = require('axios').default;
const ethers = require('ethers');
const configs = require('./configs');
const utils = require('./utils');

const VoucherKernel = require('../abis/VoucherKernel.json');
const Cashier = require('../abis/Cashier.json');

const WITHDRAWAL_BLACKLISTED_VOUCHER_IDS = [
    '57896044618658097711785492504343953936503180973527497460166655619477842952194',
    '57896044618658097711785492504343953937183745707369374387093404834341379375105',
    '57896044618658097711785492504343953940926851743499697485190525516090829701121',
    '57896044618658097711785492504343953942968545945025328265970773160681438969857',
];

exports.scheduledKeepersWithdrawalsDev = functions.https.onRequest(async (request, response) => {
    const dev = configs('dev');
    const provider = ethers.getDefaultProvider(dev.NETWORK_NAME, {
        etherscan: dev.ETHERSCAN_API_KEY,
        infura: dev.INFURA_API_KEY,
    });

    const executor = new ethers.Wallet(dev.EXECUTOR_PRIVATE_KEY, provider);

    axios.defaults.headers.common = {
        Authorization: `Bearer ${dev.GCLOUD_SECRET}`,
    };

    // Withdrawal process
    await triggerWithdrawals(executor, dev);

    response.send('Withdrawal process was executed successfully!');
});

exports.scheduledKeepersWithdrawalsDemo = functions.https.onRequest(async (request, response) => {
    const demo = configs('demo');
    const provider = ethers.getDefaultProvider(demo.NETWORK_NAME, {
        etherscan: demo.ETHERSCAN_API_KEY,
        infura: demo.INFURA_API_KEY,
    });

    const executor = new ethers.Wallet(demo.EXECUTOR_PRIVATE_KEY, provider);

    axios.defaults.headers.common = {
        Authorization: `Bearer ${demo.GCLOUD_SECRET}`,
    };

    // Withdrawal process
    await triggerWithdrawals(executor, demo);

    response.send('Withdrawal process was executed successfully!');
});

async function triggerWithdrawals(executor, config) {
    let hasErrors = false;
    let cashierContractExecutor = new ethers.Contract(config.CASHIER_ADDRESS, Cashier.abi, executor);
    let voucherKernelContractExecutor = new ethers.Contract(config.VOUCHER_KERNEL_ADDRESS, VoucherKernel.abi, executor);
    let res;

    try {
        res = await axios.get(config.ALL_VOUCHERS_URL);
    } catch (e) {
        console.error(`Error while getting all vouchers from the DB. Error: ${e}`);
    }

    if (typeof res === 'undefined' || !Object.prototype.hasOwnProperty.call(res, 'data')) return;

    for (let i = 0; i < res.data.vouchers.length; i++) {
        let voucher = res.data.vouchers[i];
        let voucherID = voucher._tokenIdVoucher;
        let isPaymentAndDepositsReleased;

        try {
            let voucherStatus = await voucherKernelContractExecutor.getVoucherStatus(voucherID); // (vouchersStatus[_tokenIdVoucher].status, vouchersStatus[_tokenIdVoucher].isPaymentReleased, vouchersStatus[_tokenIdVoucher].isDepositsReleased)
            isPaymentAndDepositsReleased = voucherStatus[1] && voucherStatus[2];
        } catch (e) {
            hasErrors = true;
            console.error(`Error while checking existing payments for a voucher from the DB. Error: ${e}`);
            continue;
        }

        if (isPaymentAndDepositsReleased || WITHDRAWAL_BLACKLISTED_VOUCHER_IDS.includes(voucherID)) {
            console.log(`Voucher: ${voucherID} - a payment and deposits withdrawal completed `);
            continue;
        }

        console.log(`Voucher: ${voucherID}. The withdraw process has started`);

        let txOrder;
        let receipt;

        try {
            txOrder = await cashierContractExecutor.withdraw(voucherID, {
                gasLimit: config.GAS_LIMIT,
            });
            receipt = await txOrder.wait();
        } catch (e) {
            hasErrors = true;
            console.error(`Error while executing withdraw process. Error: ${e}`);
            continue;
        }

        console.log(`Voucher: ${voucherID}. The withdraw process finished`);

        let events = await utils.findEventByName(receipt, 'LogAmountDistribution', '_tokenIdVoucher', '_to', '_payment', '_type');

        try {
            if (
                Array.isArray(events) &&
                typeof events[0] === 'object' &&
                Object.prototype.hasOwnProperty.call(events[0], '_tokenIdVoucher')
            ) {
                await sendPayments(config, events);
            }
        } catch (e) {
            hasErrors = true;
            console.error(`Error while executing a create payment call to the backend . Error: ${e}`);
            console.error(e);
        }

        console.log(`Voucher: ${voucherID}. Database updated`);
    }

    let infoMsg = hasErrors ? 'triggerWithdrawals function finished with errors' : 'triggerWithdrawals function finished successfully';

    console.info(infoMsg);
}

async function sendPayments(config, events) {
    try {
        await axios.post(config.WITHDRAW_VOUCHER_URL, events);
    } catch (error) {
        console.log(error);
    }
}
