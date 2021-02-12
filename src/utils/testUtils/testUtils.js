class TestUtils {
  constructor(provider) {
    this.provider = provider;
  }

  async findEventByName(txReceipt, eventName, ...eventFields) {
    for (const key in txReceipt.events) {
      if (txReceipt.events[key].event == eventName) {
        const event = txReceipt.events[key];

        const resultObj = {
          txHash: txReceipt.transactionHash,
        };

        for (let index = 0; index < eventFields.length; index++) {
          resultObj[eventFields[index]] = event.args[
            eventFields[index]
          ].toString();
        }
        return resultObj;
      }
    }
  }

  async getCurrTimestamp() {
    let blockNumber = await this.provider.getBlockNumber();
    let block = await this.provider.getBlock(blockNumber);

    return block.timestamp;
  }
}

module.exports = TestUtils;
