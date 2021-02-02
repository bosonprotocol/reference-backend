const functions = require("firebase-functions");

const apiUrl = functions.config().dev.apiurl;

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
    FINALIZE_VOUCHER_URL: `${apiUrl}/vouchers/finalize`,
    WITHDRAW_VOUCHER_URL: `${apiUrl}/payments/create-payment`,
    GCLOUD_SECRET: functions.config().dev.gcloudsecret,
    GAS_LIMIT: "3000000",
  },
};

function getConfigParams(version) {
  return configs[version];
}

module.exports = getConfigParams;
