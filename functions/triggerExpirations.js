const functions = require("firebase-functions");
const axios = require("axios").default;
const ethers = require("ethers");
const configs = require("./configs");

const VoucherKernel = require("./abis/VoucherKernel.json");

const COMMIT_IDX = 7; // usingHelpers contract

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

  if (typeof res === "undefined" || !res.hasOwnProperty("data")) return;

  for (let i = 0; i < res.data.vouchers.length; i++) {
    let voucher = res.data.vouchers[i];
    let voucherID = voucher._tokenIdVoucher;
    let isStatusCommit = false;

    try {
      let voucherStatus = await voucherKernelContractExecutor.getVoucherStatus(
        voucherID
      );
      isStatusCommit = voucherStatus[0] == (0 | (1 << COMMIT_IDX)); // condition is borrowed from helper contract
    } catch (e) {
      hasErrors = true;
      console.error(
        `Error while checking voucher status toward the contract. Error: ${e}`
      );
    }

    if (
      !isStatusCommit ||
      EXPIRATION_BLACKLISTED_VOUCHER_IDS.includes(voucherID)
    ) {
      continue;
    }

    console.log(
      `Voucher: ${voucherID} is with commit status. The expiration is triggered.`
    );

    try {
      let txOrder = await voucherKernelContractExecutor.triggerExpiration(
        voucherID
      );
      await txOrder.wait();
    } catch (e) {
      hasErrors = true;
      console.error(
        `Error while triggering expiration of the voucher. Error: ${e}`
      );
    }
  }

  let infoMsg = hasErrors
    ? "triggerExpirations function finished with errors"
    : "triggerExpirations function finished successfully";

  console.info(infoMsg);
}
