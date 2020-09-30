const functions = require('firebase-functions');
const axios = require('axios').default;

const VOUCHER_KERNEL_ADDRESS = functions.config().scheduledkeepers.voucherkerneladdress;
const CASHIER_ADDRESS = functions.config().scheduledkeepers.cashieraddress;

const VoucherKernel = require("./abis/VoucherKernel.json");
const Cashier = require("./abis/Cashier.json");

const ethers = require('ethers');

const EXECUTOR_PRIVATE_KEY = functions.config().scheduledkeepers.executorsecret;
const NETWORK_NAME = functions.config().scheduledkeepers.networkname;
const ETHERSCAN_API_KEY = functions.config().scheduledkeepers.etherscanapikey;
const INFURA_API_KEY = functions.config().scheduledkeepers.infuraapikey;

const provider = ethers.getDefaultProvider(NETWORK_NAME, {
    etherscan: ETHERSCAN_API_KEY,
    infura: INFURA_API_KEY
});
const executor = new ethers.Wallet(EXECUTOR_PRIVATE_KEY, provider);

const API_URL = functions.config().scheduledkeepers.apiurl;
const ALL_VOUCHERS_URL = `${ API_URL }/user-vouchers/all`;
const CHECK_PAYMENTS_BY_VOUCHER_URL = `${ API_URL }/payments/check-payment`;
const FINALIZE_VOUCHER_URL = `${ API_URL }/user-vouchers/finalize`;
const WITHDRAW_VOUCHER_URL = `${ API_URL }/payments/create-payment`;

const COMMIT_IDX = 7; // usingHelpers contract

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

exports.scheduledKeepers = functions.https.onRequest(async (request, response) => {
    // Expiration process
    await triggerExirations();

    // Finalization process
    await triggerFinalizations();

    // Withdrawal process
    await triggerWithdrawals();

    response.send("Аll keepers were executed successfully!");
});

async function triggerExirations() {
    let voucherKernelContractExecutor = new ethers.Contract(VOUCHER_KERNEL_ADDRESS, VoucherKernel.abi, executor);
    let vouchers;

    try {
        vouchers = await axios.get(ALL_VOUCHERS_URL);
    } catch (e) {
        console.error(`Error while getting all vouchers from the DB. Error: ${ e }`);
    }

    for (let i = 0; i < vouchers.data.vouchersDocuments.length; i++) {
        let voucher = vouchers.data.vouchersDocuments[i];
        let voucherID = voucher._tokenIdVoucher;
        let isStatusCommit = false;

        try {
            let voucherStatus = await voucherKernelContractExecutor.getVoucherStatus(voucherID);
            isStatusCommit = voucherStatus[0] == (0 | 1 << COMMIT_IDX); // condition is borrowed from helper contract
        } catch (e) {
            console.error(`Error while checking voucher status toward the contract. Error: ${ e }`);
        }

        if (!isStatusCommit || EXPIRATION_BLACKLISTED_VOUCHER_IDS.includes(voucherID)) {
            continue;
        }

        console.log(`Voucher: ${ voucherID } is with commit status. The expiration is triggered.`);

        try {
            let txOrder = await voucherKernelContractExecutor.triggerExpiration(voucherID);
            await txOrder.wait();
        } catch (e) {
            console.error(`Error while triggering expiration of the voucher. Error: ${ e }`);
        }
    }

    console.info(`triggerExirations function finished successfully`);
}

async function triggerFinalizations() {
    let voucherKernelContractExecutor = new ethers.Contract(VOUCHER_KERNEL_ADDRESS, VoucherKernel.abi, executor);
    let vouchers;

    try {
        vouchers = await axios.get(ALL_VOUCHERS_URL);
    } catch (e) {
        console.error(`Error while getting all vouchers from the DB. Error: ${ e }`);
    }

    for (let i = 0; i < vouchers.data.vouchersDocuments.length; i++) {
        let voucher = vouchers.data.vouchersDocuments[i];
        let voucherID = voucher._tokenIdVoucher;

        if (voucher.FINALIZED || FINALIZATION_BLACKLISTED_VOUCHER_IDS.includes(voucherID)) {
            console.log(`Voucher: ${ voucherID } is already finalized`);
            continue;
        }

        console.log(`Voucher: ${ voucherID }. The finalization has started.`);

        let txOrder;
        let receipt;

        try {
            txOrder = await voucherKernelContractExecutor.triggerFinalizeVoucher(voucherID);

            receipt = await txOrder.wait();
        } catch (e) {
            console.error(`Error while triggering finalization of the voucher. Error: ${ e }`);
        }
        let parsedEvent = await findEventByName(receipt, 'LogFinalizeVoucher', '_tokenIdVoucher', '_triggeredBy')

        if (parsedEvent && parsedEvent[0]) {
            parsedEvent[0]._tokenIdVoucher = voucherID;
            const payload = [{
                ...parsedEvent[0],
                status: "FINALIZED"
            }];

            console.log(`Voucher: ${ voucherID }. The finalization finished.`);

            try {
                await axios.patch(FINALIZE_VOUCHER_URL, payload);

                console.log(`Voucher: ${ voucherID }. Database updated.`);
            } catch (e) {
                console.log(e);
                console.error(`Error while updating the DB related to finalization of the voucher. Error: ${ e }`);
            }
        }
    }

    console.info(`triggerFinalizations function finished successfully`);
}

async function triggerWithdrawals() {
    let cashierContractExecutor = new ethers.Contract(CASHIER_ADDRESS, Cashier.abi, executor);
    let vouchers;

    try {
        vouchers = await axios.get(ALL_VOUCHERS_URL);
    } catch (e) {
        console.error(`Error while getting all vouchers from the DB. Error: ${ e }`);
    }

    for (let i = 0; i < vouchers.data.vouchersDocuments.length; i++) {
        let voucher = vouchers.data.vouchersDocuments[i];
        let voucherID = voucher._tokenIdVoucher;
        let paymentsCheck;

        try {
            paymentsCheck = await axios.get(`${ CHECK_PAYMENTS_BY_VOUCHER_URL }/${ voucherID }`);
        } catch (e) {
            console.error(`Error while checking existing payments for a voucher from the DB. Error: ${ e }`);
        }

        if (paymentsCheck.data.payments.length > 0 || WITHDRAWAL_BLACKLISTED_VOUCHER_IDS.includes(voucherID)) {
            console.log(`Voucher: ${ voucherID } has ${ paymentsCheck.data.payments.length } payments`);
            continue;
        }

        console.log(`Voucher: ${ voucherID }. The withdraw process has started`);

        let txOrder;
        let receipt;

        try {
            txOrder = await cashierContractExecutor.withdraw([voucherID]);
            receipt = await txOrder.wait();
        } catch (e) {
            console.error(`Error while executing withdraw process. Error: ${ e }`);
        }

        console.log(`Voucher: ${ voucherID }. The withdraw process finished`);

        let events = await findEventByName(receipt, 'LogWithdrawal', '_caller', '_payee', '_payment')

        for (const key in events) {
            events[key]._tokenIdVoucher = voucherID;
        }

        try {
            await sendPayments(events);
        } catch (e) {
            console.error(`Error while executing a create payment call to the backend . Error: ${ e }`);
        }

        console.log(`Voucher: ${ voucherID }. Database updated`);
    }

    console.info(`triggerWithdrawals function finished successfully`);
}

async function findEventByName(txReceipt, eventName, ...eventFields) {
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

async function sendPayments(events) {
    try {
        await axios.post(WITHDRAW_VOUCHER_URL, events)
    } catch (error) {
        console.log(error);
    }
}
