const AWS = require('aws-sdk')
const region = "eu-west-2"
const sm = new AWS.SecretsManager({region})
const ethers = require('ethers')

const getSecrets = async (SecretId) => {
    return await new Promise((resolve, reject) => {
        sm.getSecretValue({SecretId}, (err, result) => {
            if (err) reject(err)
            else resolve(JSON.parse(result.SecretString))
        })
    })
}

const configs = {
  local: () => {
    throw new Error('Local run is expected to use config defined in a specific module')
  },
  cloud: secrets => {
    const apiUrl = secrets.apiurl;

    return {
      VOUCHER_KERNEL_ADDRESS: secrets.voucherkerneladdress,
      CASHIER_ADDRESS: secrets.cashieraddress,
      EXECUTOR_PRIVATE_KEY: secrets.executorsecret,
      API_URL: apiUrl,
      ALL_VOUCHERS_URL: `${apiUrl}/vouchers/all`,
      UPDATE_STATUS_URL: `${apiUrl}/vouchers/update-status-from-keepers`,
      WITHDRAW_VOUCHER_URL: `${apiUrl}/payments/create-payment`,
      GCLOUD_SECRET: secrets.gcloudsecret,
      GAS_LIMIT: "6000000",
      PROVIDER: ethers.getDefaultProvider(secrets.networkname, {
        etherscan: secrets.etherscanapikey,
        infura: secrets.infuraapikey,
      })
    }
  }
};

async function getConfigParams(SecretId, env) {
  const secrets = env != 'local' ? await getSecrets(SecretId) : ''
  return configs[env](secrets);
}

module.exports = getConfigParams;
