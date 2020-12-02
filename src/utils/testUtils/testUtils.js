
class TestUtils {

    constructor(provider) {
        this.provider = provider;
    }


    async findEventByName(txReceipt, eventName, ...eventFields) {

        for (const key in txReceipt.events) {
            if (txReceipt.events[key].event == eventName) {
                const event = txReceipt.events[key]

                const resultObj = {
                    txHash: txReceipt.transactionHash
                }

                for (let index = 0; index < eventFields.length; index++) {
                    resultObj[eventFields[index]] = event.args[eventFields[index]].toString();
                }
                return resultObj
            }
        }
    }

    async getCurrTimestamp() {
        let blockNumber = await this.provider.getBlockNumber()
        let block = await this.provider.getBlock(blockNumber)

        return block.timestamp
    }

    prepareMetaDataForVoucherBatchCreation(data, event) {
        /**
         * title: metadata.title,
            qty: metadata.qty,
            category: metadata.category,
            startDate: metadata.startDate,
            expiryDate: metadata.expiryDate,
            offeredDate: metadata.offeredDate,
            price: metadata.price,
            buyerDeposit: metadata.buyerDeposit,
            sellerDeposit: metadata.sellerDeposit,
            description: metadata.description,
            location: metadata.location,
            contact: metadata.contact,
            conditions: metadata.conditions,
            voucherOwner: voucherOwner,
            visible: true,
            txHash: metadata.txHash,
            _tokenIdSupply: metadata._tokenIdSupply,
            _promiseId: metadata._promiseId,
            imagefiles: fileRefs,
         */

         return {
             title: data.title,
             
         }
    }
}

module.exports = TestUtils;