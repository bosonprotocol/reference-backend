const axios = require('axios').default
const ethers = require('ethers')

const configs = {
  local: () => {
    throw new Error('Local run is expected to use config defined in a specific module')
  },
  cloud: async () => {
    const apiUrl = process.env.API_URL;
    const contracts = (await axios.get(`${apiUrl}/config/contracts`)).data.contracts
    
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
      PROVIDER: ethers.getDefaultProvider(process.env.NETWORK_NAME, {
        etherscan: process.env.ETHERSCAN_API_KEY,
        infura: process.env.INFURA_API_KEY,
      })
    }
  }
};

function getConfigParams(env) {
  return configs[env]();
}

module.exports = getConfigParams;
