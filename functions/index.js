const functions = require('firebase-functions');
const axios = require('axios').default;
const ethers = require('ethers');
const configs = require('./configs')

const VoucherKernel = require("./abis/VoucherKernel.json");
const Cashier = require("./abis/Cashier.json");

const COMMIT_IDX = 7; // usingHelpers contract
const GAS_LIMIT = '300000';

const EXPIRATION_BLACKLISTED_VOUCHER_IDS = [
    "57896044618658097711785492504343953937183745707369374387093404834341379375105",
    "57896044618658097711785492504343953940926851743499697485190525516090829701121",
    "57896044618658097711785492504343953942968545945025328265970773160681438969857"
];

const FINALIZATION_BLACKLISTED_VOUCHER_IDS = [
    "57896044618658097711785492504343953936503180973527497460166655619477842952194",
    "57896044618658097711785492504343953937183745707369374387093404834341379375105",
    "57896044618658097711785492504343953940926851743499697485190525516090829701121",
    "57896044618658097711785492504343953942968545945025328265970773160681438969857"
];

const WITHDRAWAL_BLACKLISTED_VOUCHER_IDS = [
    "57896044618658097711785492504343953936503180973527497460166655619477842952194",
    "57896044618658097711785492504343953937183745707369374387093404834341379375105",
    "57896044618658097711785492504343953940926851743499697485190525516090829701121",
    "57896044618658097711785492504343953942968545945025328265970773160681438969857"
];

exports.scheduledKeepersDev = functions.https.onRequest(async (request, response) => {
    const dev = configs('dev')
    const provider = ethers.getDefaultProvider(dev.NETWORK_NAME, {
        etherscan: dev.ETHERSCAN_API_KEY,
        infura: dev.INFURA_API_KEY
    });

    const executor = new ethers.Wallet(dev.EXECUTOR_PRIVATE_KEY, provider);

    axios.defaults.headers.common = {
        Authorization: `Bearer ${dev.GCLOUD_SECRET}`
    }

    // Expiration process
    await triggerExpirations(executor, dev);

    // Finalization process
    await triggerFinalizations(executor, dev);

    // Withdrawal process
    await triggerWithdrawals(executor, dev);

    response.send("Аll keepers were executed successfully!");
});

async function triggerExpirations(executor, config) {
    let hasErrors = false;
    let voucherKernelContractExecutor = new ethers.Contract(config.VOUCHER_KERNEL_ADDRESS, VoucherKernel.abi, executor);
    let res

    try {
        res = await axios.get(config.ALL_VOUCHERS_URL);
    } catch (e) {
        hasErrors = true;
        console.error(`Error while getting all vouchers from the DB. Error: ${e}`);
    }

    if (typeof res === 'undefined' || !res.hasOwnProperty('data')) return;

    for (let i = 0; i < res.data.vouchers.length; i++) {
        let voucher = res.data.vouchers[i];
        let voucherID = voucher._tokenIdVoucher;
        let isStatusCommit = false;

        try {
            let voucherStatus = await voucherKernelContractExecutor.getVoucherStatus(voucherID);
            isStatusCommit = voucherStatus[0] == (0 | 1 << COMMIT_IDX); // condition is borrowed from helper contract
        } catch (e) {
            hasErrors = true;
            console.error(`Error while checking voucher status toward the contract. Error: ${e}`);
        }

        if (!isStatusCommit || EXPIRATION_BLACKLISTED_VOUCHER_IDS.includes(voucherID)) {
            continue;
        }

        console.log(`Voucher: ${voucherID} is with commit status. The expiration is triggered.`);

        try {
            let txOrder = await voucherKernelContractExecutor.triggerExpiration(voucherID);
            await txOrder.wait();
        } catch (e) {
            hasErrors = true;
            console.error(`Error while triggering expiration of the voucher. Error: ${e}`);
        }
    }

    let infoMsg = hasErrors ? 'triggerExpirations function finished with errors' : 'triggerExpirations function finished successfully'

    console.info(infoMsg);
}

async function triggerFinalizations(executor, config) {
    let hasErrors = false;
    let voucherKernelContractExecutor = new ethers.Contract(config.VOUCHER_KERNEL_ADDRESS, VoucherKernel.abi, executor);
    let res;

    try {
        res = await axios.get(config.ALL_VOUCHERS_URL);
    } catch (e) {
        console.error(`Error while getting all vouchers from the DB. Error: ${e}`);
        return;
    }

    if (typeof res === 'undefined' || !res.hasOwnProperty('data')) return;

    for (let i = 0; i < res.data.vouchers.length; i++) {
        let voucher = res.data.vouchers[i];
        let voucherID = voucher._tokenIdVoucher;

        if (voucher.FINALIZED || FINALIZATION_BLACKLISTED_VOUCHER_IDS.includes(voucherID)) {
            console.log(`Voucher: ${voucherID} is already finalized`);
            continue;
        }

        console.log(`Voucher: ${voucherID}. The finalization has started.`);

        let txOrder;
        let receipt;

        try {
            txOrder = await voucherKernelContractExecutor.triggerFinalizeVoucher(voucherID, { gasLimit: GAS_LIMIT });

            receipt = await txOrder.wait();
        } catch (e) {
            hasErrors = true;
            console.error(`Error while triggering finalization of the voucher. Error: ${e}`);
            continue;
        }
        let parsedEvent = await findEventByName(receipt, 'LogFinalizeVoucher', '_tokenIdVoucher', '_triggeredBy');

        if (parsedEvent && parsedEvent[0]) {
            parsedEvent[0]._tokenIdVoucher = voucherID;
            const payload = [{
                ...parsedEvent[0],
                status: "FINALIZED"
            }];

            console.log(`Voucher: ${voucherID}. The finalization finished.`);

            try {
                await axios.patch(
                    config.FINALIZE_VOUCHER_URL,
                    payload
                );

                console.log(`Voucher: ${voucherID}. Database updated.`);
            } catch (e) {
                hasErrors = true;
                console.log(e);
                console.error(`Error while updating the DB related to finalization of the voucher. Error: ${e}`);
                continue;
            }
        }
    }

    let infoMsg = hasErrors ? 'triggerFinalizations function finished with errors' : 'triggerFinalizations function finished successfully'

    console.info(infoMsg);
}

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

    if (typeof res === 'undefined' || !res.hasOwnProperty('data')) return;

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
            txOrder = await cashierContractExecutor.withdraw(voucherID, { gasLimit: GAS_LIMIT });
            receipt = await txOrder.wait();
        } catch (e) {
            hasErrors = true;
            console.error(`Error while executing withdraw process. Error: ${e}`);
            continue;
        }

        console.log(`Voucher: ${voucherID}. The withdraw process finished`);

        let events = await findEventByName(receipt, 'LogAmountDistribution', '_tokenIdVoucher', '_to', '_payment', '_type')

        try {
            if (Array.isArray(events)
                && typeof events[0] === 'object'
                && events[0].hasOwnProperty('_tokenIdVoucher')) {

                await sendPayments(config, events);
            }
        } catch (e) {
            hasErrors = true;
            console.error(`Error while executing a create payment call to the backend . Error: ${e}`);
            console.error(e);
        }

        console.log(`Voucher: ${voucherID}. Database updated`);
    }

    let infoMsg = hasErrors ? 'triggerWithdrawals function finished with errors' : 'triggerWithdrawals function finished successfully'

    console.info(infoMsg);
}

async function triggerWithdrawalsPOC1(executor, config) {
    let hasErrors = false;
    let cashierContractExecutor = new ethers.Contract(config.CASHIER_ADDRESS, Cashier.abi, executor);
    let voucherKernelContractExecutor = new ethers.Contract(config.VOUCHER_KERNEL_ADDRESS, VoucherKernel.abi, executor);
    let vouchers;

    try {
        vouchers = await axios.get(config.ALL_VOUCHERS_URL);
    } catch (e) {
        console.error(`Error while getting all vouchers from the DB. Error: ${e}`);
    }

    if (typeof vouchers === 'undefined' || !vouchers.hasOwnProperty('data')) return;

    for (let i = 0; i < vouchers.data.vouchersDocuments.length; i++) {
        let voucher = vouchers.data.vouchersDocuments[i];
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
            txOrder = await cashierContractExecutor.withdraw([voucherID], { gasLimit: GAS_LIMIT });
            receipt = await txOrder.wait();
        } catch (e) {
            hasErrors = true;
            console.error(`Error while executing withdraw process. Error: ${e}`);
            continue;
        }

        console.log(`Voucher: ${voucherID}. The withdraw process finished`);

        let events = await findEventByName(receipt, 'LogWithdrawal', '_caller', '_payee', '_payment')

        try {
            if (Array.isArray(events)
                && typeof events[0] === 'object') {
                for (const key in events) {
                    events[key]._tokenIdVoucher = voucherID;
                }

                await sendPayments(config, events);
            }
        } catch (e) {
            hasErrors = true;
            console.error(`Error while executing a create payment call to the backend . Error: ${e}`);
            console.error(e);
        }

        console.log(`Voucher: ${voucherID}. Database updated`);
    }

    let infoMsg = hasErrors ? 'triggerWithdrawals function finished with errors' : 'triggerWithdrawals function finished successfully'

    console.info(infoMsg);
}

async function findEventByName(txReceipt, eventName, ...eventFields) {
    if (typeof txReceipt !== 'object' && txReceipt !== null) return

    let eventsArr = [];

    for (const key in txReceipt.events) {
        if (txReceipt.events[key].event == eventName) {
            const event = txReceipt.events[key]

            const resultObj = {
                txHash: txReceipt.transactionHash
            };

            for (let index = 0; index < eventFields.length; index++) {
                resultObj[eventFields[index]] = event.args[eventFields[index]].toString();
            }
            eventsArr.push(resultObj)
        }
    }

    return eventsArr
}

async function sendPayments(config, events) {
    try {
        await axios.post(
            config.WITHDRAW_VOUCHER_URL, 
            events, 
        )
    } catch (error) {
        console.log(error);
    }
}
