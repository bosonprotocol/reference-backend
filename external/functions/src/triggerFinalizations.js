/* eslint-disable no-console */
const functions = require("firebase-functions");
const axios = require("axios").default;
const ethers = require("ethers");
const BN = ethers.BigNumber.from;

const configs = require("./configs");
const utils = require("./utils");

const VoucherKernel = require("../abis/VoucherKernel.json");

const FINALIZATION_BLACKLISTED_VOUCHER_IDS = [
  "57896044618658097711785492504343953936503180973527497460166655619477842952194",
  "57896044618658097711785492504343953937183745707369374387093404834341379375105",
  "57896044618658097711785492504343953940926851743499697485190525516090829701121",
  "57896044618658097711785492504343953942968545945025328265970773160681438969857",
];

exports.scheduledKeepersFinalizationsDev = functions.https.onRequest(
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

    // Finalization process
    await triggerFinalizations(executor, dev);

    response.send("Finalization process was executed successfully!");
  }
);

exports.scheduledKeepersFinalizationsDemo = functions.https.onRequest(
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

    // Finalization process
    await triggerFinalizations(executor, demo);

    response.send("Finalization process was executed successfully!");
  }
);

exports.scheduledKeepersFinalizationsPlayground = functions.https.onRequest(
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

    // Finalization process
    await triggerFinalizations(executor, playground);

    response.send("Finalization process was executed successfully!");
  }
);

async function triggerFinalizations(executor, config) {
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
    console.error(`Error while getting all vouchers from the DB. Error: ${e}`);
    return;
  }

  if (
    typeof res === "undefined" ||
    !Object.prototype.hasOwnProperty.call(res, "data")
  )
    return;

  for (let i = 0; i < res.data.vouchers.length; i++) {
    let voucher = res.data.vouchers[i];
    let voucherID = voucher._tokenIdVoucher;

    if (!voucher.blockchainAnchored) {
      console.log(`Voucher: ${voucherID} is not anchored on blockchain`);
      continue;
    }

    if (!!(voucher.FINALIZED)) {
      console.log(`Voucher: ${voucherID} is already finalized`);
      continue
    }

    let voucherStatus;

    try {
      voucherStatus = await voucherKernelContractExecutor.vouchersStatus(
        voucherID
      );
    } catch (e) {
      hasErrors = true;
      console.error(
        `Error while checking voucher status toward the contract. Error: ${e}`
      );
      continue;
    }

    console.log(`Voucher: ${voucherID}. The finalization has started.`);

    try {
      let status = voucherStatus.status;

      let isFinalized = utils.isStatus(status, utils.IDX_FINAL);

      if (isFinalized) {
        console.log(
          `Voucher: ${voucherID} is with finalized, but the DB was not updated while the event was triggered. Updating Database only.`
        );

        const payload = [
          {
            _tokenIdVoucher: voucherID,
            status: "FINALIZED",
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

    if (!await shouldTriggerFinalization(config, executor, voucherID, voucherStatus)) {
      continue;
    }

    let txOrder;
    let receipt;

    try {
      txOrder = await voucherKernelContractExecutor.triggerFinalizeVoucher(
        voucherID,
        { gasLimit: config.GAS_LIMIT }
      );

      receipt = await txOrder.wait();
    } catch (e) {
      hasErrors = true;
      console.error(
        `Error while triggering finalization of the voucher. Error: ${e}`
      );
      continue;
    }
    let parsedEvent = await utils.findEventByName(
      receipt,
      "LogFinalizeVoucher",
      "_tokenIdVoucher",
      "_triggeredBy"
    );

    if (parsedEvent && parsedEvent[0]) {
      parsedEvent[0]._tokenIdVoucher = voucherID;
      const payload = [
        {
          ...parsedEvent[0],
          status: "FINALIZED",
        },
      ];

      console.log(`Voucher: ${voucherID}. The finalization finished.`);

      try {
        await axios.patch(config.UPDATE_STATUS_URL, payload);

        console.log(`Voucher: ${voucherID}. Database updated.`);
      } catch (e) {
        hasErrors = true;
        console.log(e);
        console.error(
          `Error while updating the DB related to finalization of the voucher. Error: ${e}`
        );
      }
    }
  }

  let infoMsg = hasErrors
    ? "triggerFinalizations function finished with errors"
    : "triggerFinalizations function finished successfully";

  console.info(infoMsg);
}

async function shouldTriggerFinalization(config, executor, voucherId, voucherStatus) {
  let currTimestamp = await utils.getCurrTimestamp(executor.provider)
  let voucherValidTo = await utils.getVoucherValidTo(config, executor, voucherId)

  const complainPeriod = await utils.getComplainPeriod(config, executor)
  const cancelFaultPeriod = await utils.getCancelFaultPeriod(config, executor)

  let mark = false

  if (utils.isStatus(voucherStatus.status, utils.IDX_COMPLAIN)) {
    if (utils.isStatus(voucherStatus.status, utils.IDX_CANCEL_FAULT)) {
      mark = true
    }
    else if (BN(currTimestamp).gte(BN(voucherStatus.cancelFaultPeriodStart).add(cancelFaultPeriod))) {
      mark = true
    }
  } else if ( //here
    utils.isStatus(voucherStatus.status, utils.IDX_CANCEL_FAULT) &&
    BN(currTimestamp).gte(BN(voucherStatus.complainPeriodStart).add(complainPeriod))
  ) {
      //if COF: then final after complain period
      mark = true;
  } else if (
      utils.isStateRedemptionSigned(voucherStatus.status) || utils.isStateRefunded(voucherStatus.status)
  ) {
      //if RDM/RFND NON_COMPLAIN: then final after complainPeriodStart + complainPeriod
      if (
        BN(currTimestamp).gte(BN(voucherStatus.complainPeriodStart).add(complainPeriod))
      ) {
          mark = true;
      }
  } else if (utils.isStateExpired(voucherStatus.status)) {
      //if EXP NON_COMPLAIN: then final after validTo + complainPeriod
      if (BN(currTimestamp).gte(BN(voucherValidTo).add(complainPeriod))) {
          mark = true;
      }
  }

  return mark
}
