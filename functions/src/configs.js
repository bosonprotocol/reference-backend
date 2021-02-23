const functions = require("firebase-functions");

const apiUrl = functions.config().dev.apiurl;
const demoApiUrl = functions.config().demo.apiurl;

const configs = {
  dev: {
    VOUCHER_KERNEL_ADDRESS: functions.config().dev.voucherkerneladdress,
    CASHIER_ADDRESS: functions.config().dev.cashieraddress,
    EXECUTOR_PRIVATE_KEY: functions.config().dev.executorsecret,
    NETWORK_NAME: functions.config().dev.networkname,
    ETHERSCAN_API_KEY: functions.config().dev.etherscanapikey,
    INFURA_API_KEY: functions.config().dev.infuraapikey,
    API_URL: apiUrl,
    ALL_VOUCHERS_URL: `${apiUrl}/vouchers/all`,
    UPDATE_STATUS_URL: `${apiUrl}/vouchers/update-status-from-keepers`,
    WITHDRAW_VOUCHER_URL: `${apiUrl}/payments/create-payment`,
    GCLOUD_SECRET: functions.config().dev.gcloudsecret,
    GAS_LIMIT: "3000000",
  },
  demo: {
    VOUCHER_KERNEL_ADDRESS: functions.config().demo.voucherkerneladdress,
    CASHIER_ADDRESS: functions.config().demo.cashieraddress,
    EXECUTOR_PRIVATE_KEY: functions.config().demo.executorsecret,
    NETWORK_NAME: functions.config().demo.networkname,
    ETHERSCAN_API_KEY: functions.config().demo.etherscanapikey,
    INFURA_API_KEY: functions.config().demo.infuraapikey,
    API_URL: demoApiUrl,
    ALL_VOUCHERS_URL: `${demoApiUrl}/vouchers/all`,
    UPDATE_STATUS: `${demoApiUrl}/vouchers/update-status-from-keepers`,
    WITHDRAW_VOUCHER_URL: `${demoApiUrl}/payments/create-payment`,
    GCLOUD_SECRET: functions.config().demo.gcloudsecret,
    GAS_LIMIT: "3000000",
  },
};

function getConfigParams(version) {
  return configs[version];
}

module.exports = getConfigParams;
