/* eslint-disable no-console */
const functions = require("firebase-functions");
const axios = require("axios").default;
const ethers = require("ethers");
const configs = require("./configs");
const utils = require("./utils");

const VoucherKernel = require("../abis/VoucherKernel.json");

const EXPIRATION_BLACKLISTED_VOUCHER_IDS = [
  "57896044618658097711785492504343953937183745707369374387093404834341379375105",
  "57896044618658097711785492504343953940926851743499697485190525516090829701121",
  "57896044618658097711785492504343953942968545945025328265970773160681438969857",
];

exports.scheduledKeepersExpirationsDev = functions.https.onRequest(
  async (request, response) => {
    const dev = configs("dev");
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

    response.send("Expiration process was executed successfully!");
  }
);

exports.scheduledKeepersExpirationsDemo = functions.https.onRequest(
  async (request, response) => {
    const demo = configs("demo");
    const provider = ethers.getDefaultProvider(demo.NETWORK_NAME, {
      etherscan: demo.ETHERSCAN_API_KEY,
      infura: demo.INFURA_API_KEY,
    });

    const executor = new ethers.Wallet(demo.EXECUTOR_PRIVATE_KEY, provider);

    axios.defaults.headers.common = {
      Authorization: `Bearer ${demo.GCLOUD_SECRET}`,
    };

    // Expiration process
    await triggerExpirations(executor, demo);

    response.send("Expiration process was executed successfully!");
  }
);

exports.scheduledKeepersExpirationsPlayground = functions.https.onRequest(
  async (request, response) => {
    const playground = configs("playground");
    const provider = ethers.getDefaultProvider(playground.NETWORK_NAME, {
      etherscan: playground.ETHERSCAN_API_KEY,
      infura: playground.INFURA_API_KEY,
    });

    const executor = new ethers.Wallet(
      playground.EXECUTOR_PRIVATE_KEY,
      provider
    );

    axios.defaults.headers.common = {
      Authorization: `Bearer ${playground.GCLOUD_SECRET}`,
    };

    // Expiration process
    await triggerExpirations(executor, playground);

    response.send("Expiration process was executed successfully!");
  }
);

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
    console.error(`Error while getting all vouchers from the DB. Error: ${e}`);
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

    if (!!(voucher.EXPIRED)) {
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
      console.error(
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
      console.error(error);
      continue;
    }

    if (!isStatusCommit || !await shouldTriggerExpiration(config, executor, voucherID)) {
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
      console.error(
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
        console.error(
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
  let currTimestamp = await utils.getCurrTimestamp(executor.provider)
  let voucherValidTo = await utils.getVoucherValidTo(config, executor, voucherId)

  return voucherValidTo < currTimestamp
}
