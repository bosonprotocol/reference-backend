const ethers = require("ethers");
const axios = require("axios").default;

const getConfigParams = require('./configs')
const SecretIdDev = "keepersServiceSecrets"
const BN = ethers.BigNumber.from;

const VoucherKernel = require("./abis/VoucherKernel.json");
const utils = require("./utils");

exports.handler = async (event) => {
 
    const dev = await getConfigParams(SecretIdDev, "dev");  
    const provider = ethers.getDefaultProvider(dev.NETWORK_NAME, {
        etherscan: dev.ETHERSCAN_API_KEY,
        infura: dev.INFURA_API_KEY,
      });
    
    const executor = new ethers.Wallet(dev.EXECUTOR_PRIVATE_KEY, provider);

    axios.defaults.headers.common = {
      Authorization: `Bearer ${dev.GCLOUD_SECRET}`,
    };

    // Expiration process
    await triggerExpirations(executor, dev);

    const response = {
        statusCode: 200,
        body: `Expirations process was executed successfully!`
    };

    return response;
};

async function triggerExpirations(executor, config) {
  let hasErrors = false;
  let voucherKernelContractExecutor = new ethers.Contract(
    config.VOUCHER_KERNEL_ADDRESS,
    VoucherKernel.abi,
    executor
  );
  let res;

  try {
    res = await axios.get(config.ALL_VOUCHERS_URL);
  } catch (e) {
    hasErrors = true;
    console.log(`Error while getting all vouchers from the DB. Error: ${e}`);
  }

  if (
    typeof res === "undefined" ||
    !Object.prototype.hasOwnProperty.call(res, "data")
  )
    return;

  for (let i = 0; i < res.data.vouchers.length; i++) {
    let voucher = res.data.vouchers[i];
    let voucherStatus; // 0 - status, 1 - isPaymentReleased, 2 - isDepositsReleased
    let voucherID = voucher._tokenIdVoucher;
    let isStatusCommit = false;

    if (!voucher.blockchainAnchored) {
      console.log(`Voucher: ${voucherID} is not anchored on blockchain`);
      continue;
    }

    if (voucher.EXPIRED) {
      console.log(`Voucher: ${voucherID} is already expired`);
      continue;
    }

    try {
      // eslint-disable-next-line no-await-in-loop
      voucherStatus = await voucherKernelContractExecutor.getVoucherStatus(
        voucherID
      );
      isStatusCommit = utils.isStateCommitted(voucherStatus[0]);
    } catch (e) {
      hasErrors = true;
      console.log(
        `Error while checking voucher status toward the contract. Error: ${e}`
      );
      continue;
    }

    try {
      let isExpired = utils.isStatus(voucherStatus[0], utils.IDX_EXPIRE);

      if (isExpired) {
        console.log(
          `Voucher: ${voucherID} is expired, but the DB was not updated while the event was triggered. Updating Database only.`
        );

        const payload = [
          {
            _tokenIdVoucher: voucherID,
            status: "EXPIRED",
          },
        ];
        await axios.patch(config.UPDATE_STATUS_URL, payload);
        console.log(`Voucher: ${voucherID}. Database updated.`);
        continue;
      }
    } catch (error) {
      console.log(error);
      continue;
    }

    if (
      !isStatusCommit ||
      !(await shouldTriggerExpiration(config, executor, voucherID))
    ) {
      continue;
    }

    console.log(
      `Voucher: ${voucherID} is with commit status. The expiration is triggered.`
    );

    let receipt;

    try {
      let txOrder = await voucherKernelContractExecutor.triggerExpiration(
        voucherID
      );
      receipt = await txOrder.wait();
    } catch (e) {
      hasErrors = true;
      console.log(
        `Error while triggering expiration of the voucher. Error: ${e}`
      );
    }

    let parsedEvent = await utils.findEventByName(
      receipt,
      "LogExpirationTriggered",
      "_tokenIdVoucher",
      "_triggeredBy"
    );

    if (parsedEvent && parsedEvent[0]) {
      parsedEvent[0]._tokenIdVoucher = voucherID;
      const payload = [
        {
          ...parsedEvent[0],
          status: "EXPIRED",
        },
      ];

      console.log(`Voucher: ${voucherID}. The expiration finished.`);

      try {
        await axios.patch(config.UPDATE_STATUS_URL, payload);

        console.log(`Voucher: ${voucherID}. Database updated.`);
      } catch (e) {
        hasErrors = true;
        console.log(e);
        console.log(
          `Error while updating the DB related to finalization of the voucher. Error: ${e}`
        );
        continue;
      }
    }
  }

  let infoMsg = hasErrors
    ? "triggerExpirations function finished with errors"
    : "triggerExpirations function finished successfully";

  console.info(infoMsg);
}

async function shouldTriggerExpiration(config, executor, voucherId) {
  let currTimestamp = await utils.getCurrTimestamp(executor.provider);
  let voucherValidTo = await utils.getVoucherValidTo(
    config,
    executor,
    voucherId
  );

  return voucherValidTo < currTimestamp;
}