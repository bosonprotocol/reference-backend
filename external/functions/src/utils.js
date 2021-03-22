const ethers = require("ethers");
const VoucherKernel = require("../abis/VoucherKernel.json");

const ONE = 1;

const IDX_COMMIT = 7;
const IDX_REDEEM = 6;
const IDX_REFUND = 5;
const IDX_EXPIRE = 4;
const IDX_COMPLAIN = 3;
const IDX_CANCEL_FAULT = 2;
const IDX_FINAL = 1;

async function findEventByName(txReceipt, eventName, ...eventFields) {
  if (typeof txReceipt !== "object" || txReceipt === null) return;

  let eventsArr = [];

  for (const key in txReceipt.events) {
    if (
      Object.prototype.hasOwnProperty.call(txReceipt.events, key) &&
      txReceipt.events[key].event === eventName
    ) {
      const event = txReceipt.events[key];

      const resultObj = {
        txHash: txReceipt.transactionHash,
      };

      for (let index = 0; index < eventFields.length; index++) {
        resultObj[eventFields[index]] = event.args[
          eventFields[index]
        ].toString();
      }
      eventsArr.push(resultObj);
    }
  }

  return eventsArr;
}

function isStatus(_status, idx) {
  return (_status >> idx) & (ONE == 1);
}

async function getComplainPeriod(config, executor) {
  const vk = new ethers.Contract(
    config.VOUCHER_KERNEL_ADDRESS,
    VoucherKernel.abi,
    executor
  );
  return await vk.complainPeriod();
}

async function getCancelFaultPeriod(config, executor) {
  const vk = new ethers.Contract(
    config.VOUCHER_KERNEL_ADDRESS,
    VoucherKernel.abi,
    executor
  );
  return await vk.cancelFaultPeriod();
}

async function getVoucherValidTo(config, executor, voucherId) {
  const vk = new ethers.Contract(
    config.VOUCHER_KERNEL_ADDRESS,
    VoucherKernel.abi,
    executor
  );
  const promiseKey = await vk.getPromiseIdFromVoucherId(voucherId);
  return (await vk.promises(promiseKey)).validTo.toString();
}

async function getCurrTimestamp(provider) {
  let blockNumber = await provider.getBlockNumber();
  let block = await provider.getBlock(blockNumber);

  return block.timestamp;
}

function isStateCommitted(status) {
  return status == setChange(0, IDX_COMMIT);
}

function isStateRedemptionSigned(status) {
  return status == setChange(setChange(0, IDX_COMMIT), IDX_REDEEM);
}

function isStateRefunded(status) {
  return status == setChange(setChange(0, IDX_COMMIT), IDX_REFUND);
}

function isStateExpired(status) {
  return status == setChange(setChange(0, IDX_COMMIT), IDX_EXPIRE);
}

function setChange(status, changeIdx) {
  return status | (ONE << changeIdx);
}

module.exports = {
  IDX_FINAL,
  IDX_EXPIRE,
  IDX_COMPLAIN,
  IDX_CANCEL_FAULT,
  findEventByName,
  isStatus,
  getCurrTimestamp,
  getComplainPeriod,
  getCancelFaultPeriod,
  getVoucherValidTo,
  isStateCommitted,
  isStateRedemptionSigned,
  isStateRefunded,
  isStateExpired,
};
