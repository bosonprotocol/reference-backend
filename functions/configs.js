const functions = require('firebase-functions');

const configs = {
    dev: {
        VOUCHER_KERNEL_ADDRESS: functions.config().dev.voucherkerneladdress,
        CASHIER_ADDRESS: functions.config().dev.cashieraddress,
        EXECUTOR_PRIVATE_KEY: functions.config().dev.executorsecret,
        NETWORK_NAME: functions.config().dev.networkname,
        ETHERSCAN_API_KEY: functions.config().dev.etherscanapikey,
        INFURA_API_KEY: functions.config().dev.infuraapikey,
        API_URL: functions.config().dev.apiurl,
        ALL_VOUCHERS_URL: `${functions.config().dev.apiurl}/vouchers/all`,
        FINALIZE_VOUCHER_URL: `${functions.config().dev.apiurl}/vouchers/finalize`,
        WITHDRAW_VOUCHER_URL: `${functions.config().dev.apiurl}/payments/create-payment`,
        GCLOUD_SECRET: functions.config().dev.gcloudsecret,
        GAS_LIMIT: '3000000'
    }
}

function getConfigParams(version) {
    return configs[version];
}

module.exports = getConfigParams