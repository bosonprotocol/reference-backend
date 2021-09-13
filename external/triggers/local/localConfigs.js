const axios = require('axios').default
const ethers = require("ethers");

const getLocalConfigs = async () => {
  const apiUrl = process.env.API_URL;
  const contracts = (await axios.get(`${apiUrl}/config/contracts`)).data.contracts

  let connectionHeaders = {};
  if (process.env.PROVIDER_SECRET) {
    const data = `:${process.env.PROVIDER_SECRET}`;
    const buff = Buffer.from(data);
    const b64ProviderSecret = buff.toString('base64');
    connectionHeaders = {
        'Authorization': `Basic ${b64ProviderSecret}`
    };
  }

  return {
    VOUCHER_KERNEL_ADDRESS: contracts.voucherKernel,
    CASHIER_ADDRESS: contracts.cashier,
    EXECUTOR_PRIVATE_KEY: process.env.EXECUTOR_PRIVATE_KEY,
    API_URL: apiUrl,
    ALL_VOUCHERS_URL: `${apiUrl}/vouchers/all`,
    UPDATE_STATUS_URL: `${apiUrl}/vouchers/update-status-from-keepers`,
    WITHDRAW_VOUCHER_URL: `${apiUrl}/payments/create-payment`,
    GCLOUD_SECRET: process.env.GCLOUD_SECRET,
    GAS_LIMIT: "6000000",
    PROVIDER: new ethers.providers.JsonRpcProvider(
      {
        url: process.env.PROVIDER_URL,
        headers: {
          connectionHeaders
        }
      }
    ),
  }
};

module.exports = getLocalConfigs;