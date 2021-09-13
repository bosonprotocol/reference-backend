const ethers = require("ethers");
const axios = require("axios").default;

const VoucherKernel = require("../abis/VoucherKernel.json");
const Cashier = require("../abis/Cashier.json");

const utils = require("./utils");

exports.handler = async (config) => {
    if (!config) {
      throw new Error("No configs provided!")
    }
    const executor = new ethers.Wallet(config.EXECUTOR_PRIVATE_KEY, config.PROVIDER);

    axios.defaults.headers.common = {
      Authorization: `Bearer ${config.GCLOUD_SECRET}`,
    };

    // Withdrawal process
    await triggerWithdrawals(executor, config);

    const response = {
        statusCode: 200,
        body: `Withdrawals process was executed successfully!`
    };

    return response;
};

async function triggerWithdrawals(executor, config) {
  let hasErrors = false;
  let cashierContractExecutor = new ethers.Contract(
    config.CASHIER_ADDRESS,
    Cashier.abi,
    executor
  );
  let voucherKernelContractExecutor = new ethers.Contract(
    config.VOUCHER_KERNEL_ADDRESS,
    VoucherKernel.abi,
    executor
  );
  let res;

  try {
    res = await axios.get(config.ALL_VOUCHERS_URL);
  } catch (e) {
    console.log(`Error while getting all vouchers from the DB. Error: ${e}`);
  }

  if (
    typeof res === "undefined" ||
    !Object.prototype.hasOwnProperty.call(res, "data")
  )
    return;

  for (let i = 0; i < res.data.vouchers.length; i++) {
    let voucher = res.data.vouchers[i];
    let voucherID = voucher._tokenIdVoucher;
    let isPaymentAndDepositsReleased;

    if (!voucher.blockchainAnchored) {
      console.log(`Voucher: ${voucherID} is not anchored on blockchain`);
      continue;
    }

    try {
      let voucherStatus = await voucherKernelContractExecutor.getVoucherStatus(
        voucherID
      ); // (vouchersStatus[_tokenIdVoucher].status, vouchersStatus[_tokenIdVoucher].isPaymentReleased, vouchersStatus[_tokenIdVoucher].isDepositsReleased)
      isPaymentAndDepositsReleased = voucherStatus[1] && voucherStatus[2];
    } catch (e) {
      hasErrors = true;
      console.log(
        `Error while checking existing payments for a voucher from the DB. Error: ${e}`
      );
      continue;
    }

    if (isPaymentAndDepositsReleased) {
      console.log(
        `Voucher: ${voucherID} - a payment and deposits withdrawal completed `
      );
      continue;
    }

    console.log(`Voucher: ${voucherID}. The withdraw process has started`);

    let txOrder;
    let receipt;

    try {
      txOrder = await cashierContractExecutor.withdraw(voucherID, {
        gasLimit: config.GAS_LIMIT,
      });
      receipt = await txOrder.wait();
    } catch (e) {
      hasErrors = true;
      console.log(`Error while executing withdraw process. Error: ${e}`);
      continue;
    }

    console.log(`Voucher: ${voucherID}. The withdraw process finished`);

    let events = await utils.findEventByName(
      receipt,
      "LogAmountDistribution",
      "_tokenIdVoucher",
      "_to",
      "_payment",
      "_type"
    );

    try {
      if (
        Array.isArray(events) &&
        typeof events[0] === "object" &&
        Object.prototype.hasOwnProperty.call(events[0], "_tokenIdVoucher")
      ) {
        await sendPayments(config, events);
      }
    } catch (e) {
      hasErrors = true;
      console.log(
        `Error while executing a create payment call to the backend . Error: ${e}`
      );
      console.log(e);
    }

    console.log(`Voucher: ${voucherID}. Database updated`);
  }

  let infoMsg = hasErrors
    ? "triggerWithdrawals function finished with errors"
    : "triggerWithdrawals function finished successfully";

  console.info(infoMsg);
}

async function sendPayments(config, events) {
  try {
    await axios.post(config.WITHDRAW_VOUCHER_URL, events);
  } catch (error) {
    console.log(error);
  }
}

