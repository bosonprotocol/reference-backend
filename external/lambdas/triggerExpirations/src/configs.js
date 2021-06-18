const AWS = require('aws-sdk')
const region = "eu-west-2"
const sm = new AWS.SecretsManager({region})

const getSecrets = async (SecretId) => {
    return await new Promise((resolve, reject) => {
        sm.getSecretValue({SecretId}, (err, result) => {
            if (err) reject(err)
            else resolve(JSON.parse(result.SecretString))
        })
    })
}

const configs = {
  local: secrets => {
    const apiUrl = "http://localhost:3000";

    return {
      VOUCHER_KERNEL_ADDRESS: '',
      CASHIER_ADDRESS: '',
      EXECUTOR_PRIVATE_KEY: '',
      NETWORK_NAME: '',
      ETHERSCAN_API_KEY: '',
      INFURA_API_KEY: '',
      API_URL: '',
      ALL_VOUCHERS_URL: `${apiUrl}/vouchers/all`,
      UPDATE_STATUS_URL: `${apiUrl}/vouchers/update-status-from-keepers`,
      WITHDRAW_VOUCHER_URL: `${apiUrl}/payments/create-payment`,
      GCLOUD_SECRET: "",
      GAS_LIMIT: "6000000",
    }
  },
  dev: secrets => {
    const apiUrl = secrets.apiurl;

    return {
      VOUCHER_KERNEL_ADDRESS: secrets.voucherkerneladdress,
      CASHIER_ADDRESS: secrets.cashieraddress,
      EXECUTOR_PRIVATE_KEY: secrets.executorsecret,
      NETWORK_NAME: secrets.networkname,
      ETHERSCAN_API_KEY: secrets.etherscanapikey,
      INFURA_API_KEY: secrets.infuraapikey,
      API_URL: apiUrl,
      ALL_VOUCHERS_URL: `${apiUrl}/vouchers/all`,
      UPDATE_STATUS_URL: `${apiUrl}/vouchers/update-status-from-keepers`,
      WITHDRAW_VOUCHER_URL: `${apiUrl}/payments/create-payment`,
      GCLOUD_SECRET: secrets.gcloudsecret,
      GAS_LIMIT: "6000000",
    }
  },
  demo: secrets => {
    const demoApiUrl = secrets.apiurl;

    return {
      VOUCHER_KERNEL_ADDRESS: secrets.voucherkerneladdress,
      CASHIER_ADDRESS: secrets.cashieraddress,
      EXECUTOR_PRIVATE_KEY: secrets.executorsecret,
      NETWORK_NAME: secrets.networkname,
      ETHERSCAN_API_KEY: secrets.etherscanapikey,
      INFURA_API_KEY: secrets.infuraapikey,
      API_URL: demoApiUrl,
      ALL_VOUCHERS_URL: `${demoApiUrl}/vouchers/all`,
      UPDATE_STATUS_URL: `${demoApiUrl}/vouchers/update-status-from-keepers`,
      WITHDRAW_VOUCHER_URL: `${demoApiUrl}/payments/create-payment`,
      GCLOUD_SECRET: secrets.gcloudsecret,
      GAS_LIMIT: "6000000",
    }
  }
};

async function getConfigParams(SecretId, env) {
  const secrets = await getSecrets(SecretId)
  return configs[env](secrets);
}

module.exports = getConfigParams;
