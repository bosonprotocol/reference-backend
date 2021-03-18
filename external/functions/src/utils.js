const ONE = 1;
const IDX_FINAL = 1;
const IDX_EXPIRE = 4;

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

module.exports = {
  IDX_FINAL,
  IDX_EXPIRE,
  findEventByName,
  isStatus,
};
