const functions = require('firebase-functions');

const configs = {
    poc1: {
        VOUCHER_KERNEL_ADDRESS: functions.config().poc1.voucherkerneladdress,
        CASHIER_ADDRESS: functions.config().poc1.cashieraddress,
        EXECUTOR_PRIVATE_KEY: functions.config().poc1.executorsecret,
        NETWORK_NAME: functions.config().poc1.networkname,
        ETHERSCAN_API_KEY: functions.config().poc1.etherscanapikey,
        INFURA_API_KEY: functions.config().poc1.infuraapikey,
        API_URL: functions.config().poc1.apiurl,
        ALL_VOUCHERS_URL: `${functions.config().poc1.apiurl}/user-vouchers/all`,
        FINALIZE_VOUCHER_URL: `${functions.config().poc1.apiurl}/user-vouchers/finalize`,
        WITHDRAW_VOUCHER_URL: `${functions.config().poc1.apiurl}/payments/create-payment`,
        GCLOUD_SECRET: ''
    },
    dev: {
        VOUCHER_KERNEL_ADDRESS: functions.config().scheduledkeepers.voucherkerneladdress,
        CASHIER_ADDRESS: functions.config().scheduledkeepers.cashieraddress,
        EXECUTOR_PRIVATE_KEY: functions.config().scheduledkeepers.executorsecret,
        NETWORK_NAME: functions.config().scheduledkeepers.networkname,
        ETHERSCAN_API_KEY: functions.config().scheduledkeepers.etherscanapikey,
        INFURA_API_KEY: functions.config().scheduledkeepers.infuraapikey,
        API_URL: functions.config().scheduledkeepers.apiurl,
        ALL_VOUCHERS_URL: `${functions.config().scheduledkeepers.apiurl}/vouchers/all`,
        FINALIZE_VOUCHER_URL: `${functions.config().scheduledkeepers.apiurl}/vouchers/finalize`,
        WITHDRAW_VOUCHER_URL: `${functions.config().scheduledkeepers.apiurl}/payments/create-payment`,
        GCLOUD_SECRET: functions.config().scheduledkeepers.gcloudsecret
    }
}

function getConfigParams(version) {
    return configs[version];
}


module.exports = getConfigParams