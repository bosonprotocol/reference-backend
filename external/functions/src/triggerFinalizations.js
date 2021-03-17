/* eslint-disable no-console */
const functions = require("firebase-functions");
const axios = require("axios").default;
const ethers = require("ethers");

const configs = require("./configs");
const utils = require("./utils");

const VoucherKernel = require("../../abis/VoucherKernel.json");

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

    if (
      voucher.FINALIZED ||
      FINALIZATION_BLACKLISTED_VOUCHER_IDS.includes(voucherID)
    ) {
      console.log(`Voucher: ${voucherID} is already finalized`);
      continue;
    }

    console.log(`Voucher: ${voucherID}. The finalization has started.`);

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
