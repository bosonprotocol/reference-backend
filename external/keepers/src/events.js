require('dotenv').config()

const axios = require('axios').default;
const ethers = require('ethers');
const provider = new ethers.providers.JsonRpcProvider(process.env.ALCHEMY_URL ? process.env.ALCHEMY_URL : ''); //if no url is provided, fallbacks to localhost:8545 
 
const ERC1155ERC721 = require("./abis/ERC1155ERC721.json");
const VoucherKernel = require("./abis/VoucherKernel.json");
const BosonRouter = require("./abis/BosonRouter.json")

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

let VK, BR, ERC1155721;

const {
    eventNames,
    routes,
    statuses,
    errors
} = require('./config')

async function init() {
    VK = new ethers.Contract(process.env.VOUCHER_KERNEL_ADDRESS, VoucherKernel.abi, provider);
    BR = new ethers.Contract(process.env.BOSON_ROUTER_CONTRACT_ADDRESS, BosonRouter.abi, provider);
    ERC1155721 = new ethers.Contract(process.env.TOKENS_CONTRACT_ADDRESS, ERC1155ERC721.abi, provider)

    console.log('process.env.VOUCHER_KERNEL_ADDRESS: ', process.env.VOUCHER_KERNEL_ADDRESS);
    console.log('process.env.BOSON_ROUTER_CONTRACT_ADDRESS: ', process.env.BOSON_ROUTER_CONTRACT_ADDRESS);
    console.log('process.env.TOKENS_CONTRACT_ADDRESS: ', process.env.TOKENS_CONTRACT_ADDRESS);

    console.log('provider: ', provider);

    axios.defaults.headers.common = {
        Authorization: `Bearer ${process.env.GCLOUD_SECRET}`
    }
}

const RETRIES = 5

function retryUpdateWithSuccess(axiosMethod, route, metadata, retries) {
    return new Promise((resolve, _) => {
        setTimeout(async () => {
            console.log('RETRIES LEFT: ', retries);

            if (retries == 0) {
                return resolve(false);
            }

            try {
                const res = await axios[axiosMethod](route, metadata);
                if (res.status == 200) {
                    console.log('Success!');
                    return resolve(true)
                }
            } catch (error) {

                const apiOutage = error.code == errors.ECONNREFUSED
                const recordNotFound = !!(error.response && error.response.status == errors.NOT_FOUND)
                const badRequest = !!(error.response && error.response.status == errors.BAD_REQUEST)

                if (apiOutage || recordNotFound || badRequest) {
                    return resolve(retryUpdateWithSuccess(axiosMethod, route, metadata, retries - 1));
                }

                return resolve(false)
            }

        }, 5000);
    })
}

function logStart(event, updateID) {
    console.log(`=== Update from event [${event}] started! ===`);
    console.log(`=== ID [${updateID.toString()}] ===`);
}

function logFinish(event, id, errorObj) {

    if (errorObj.hasError) {
        console.log(`ERROR: ${errorObj.error.response ? errorObj.error.response.data : errorObj.error.code}`);
        console.log(`=== Update from event: [${event}] finished with Error! ID: ${id.toString()} ===`);
        return
    }

    console.log(`=== ID [${id.toString()}] was successfully updated! ===`);
}

async function logOrderCreated() {
    BR.on(eventNames.LOG_ORDER_CREATED, async (_tokenIdSupply, _voucherOwner, _quantity, _paymentType, _correlationId) => {

        let errObj = {hasError: false}
        let metadata;

        logStart(eventNames.LOG_ORDER_CREATED, _tokenIdSupply);

        try {
            const promiseId = await VK.getPromiseIdFromSupplyId(_tokenIdSupply.toString());
            const promiseDetails = await VK.getPromiseData(promiseId)
            const orderCosts = await VK.getOrderCosts(_tokenIdSupply)

            metadata = {
                _tokenIdSupply: _tokenIdSupply.toString(),
                voucherOwner: _voucherOwner.toLowerCase(),
                qty: _quantity.toString(),
                _paymentType: _paymentType.toString(),
                _correlationId: _correlationId.toString(),
                _promiseId: promiseDetails[0].toString(),
                validFrom: (ethers.BigNumber.from(promiseDetails[2]).mul(1000)).toString(),
                validTo: (ethers.BigNumber.from(promiseDetails[3]).mul(1000)).toString(),
                price: orderCosts[0].toString(),
                sellerDeposit: orderCosts[1].toString(),
                buyerDeposit: orderCosts[2].toString()
            }

            await axios.patch(`${routes.setSupplyMeta}`, metadata)
        } catch (error) {
            if (!await retryUpdateWithSuccess('patch', routes.setSupplyMeta, metadata, RETRIES)) {
                errObj = {
                    hasError: true,
                    error
                }

                logFinish(eventNames.LOG_ORDER_CREATED, _tokenIdSupply, errObj)
                return
            }
        }

        try {
            metadata = {
                name: eventNames.LOG_ORDER_CREATED,
                _correlationId: _correlationId.toString(),
                address: _voucherOwner.toLowerCase()
            }

            await axios.patch(routes.updateEventByCorrId, metadata)
        } catch (error) {
            if (!await retryUpdateWithSuccess('patch', routes.updateEventByCorrId, metadata, RETRIES)) {
                errObj = {
                    hasError: true,
                    error
                }

                logFinish(eventNames.LOG_ORDER_CREATED, _tokenIdSupply, errObj)
                return
            }
        }

        logFinish(eventNames.LOG_ORDER_CREATED, _tokenIdSupply, errObj);
    })
}

async function logVoucherSetFaultCancel() {
    VK.on(eventNames.LOG_CANCEL_FAULT_VOUCHER_SET, async (_tokenIdSupply, _voucherOwner) => {

        let errObj = {hasError: false}
        let metadata;

        logStart(eventNames.LOG_CANCEL_FAULT_VOUCHER_SET, _tokenIdSupply);

        try {
            metadata = {
                _tokenIdSupply: _tokenIdSupply.toString(),
                voucherOwner: _voucherOwner.toLowerCase(),
                qty: 0,
            }

            await axios.patch(`${routes.updateSupplyOnCancel}`, metadata)
        } catch (error) {
            if (!await retryUpdateWithSuccess('patch', routes.updateSupplyOnCancel, metadata, RETRIES)) {
                errObj = {
                    hasError: true,
                    error
                }

                logFinish(eventNames.LOG_CANCEL_FAULT_VOUCHER_SET, _tokenIdSupply, errObj)
                return
            }
        }

        try {
            metadata = {
                name: eventNames.LOG_CANCEL_FAULT_VOUCHER_SET,
                _tokenId: _tokenIdSupply.toString()
            }

            await axios.patch(routes.updateEventBeTokenId, metadata)
        } catch (error) {
            if (!await retryUpdateWithSuccess('patch', routes.updateEventBeTokenId, metadata, RETRIES)) {
                errObj = {
                    hasError: true,
                    error
                }

                logFinish(eventNames.LOG_CANCEL_FAULT_VOUCHER_SET, _tokenIdSupply, errObj)
                return
            }
        }

        logFinish(eventNames.LOG_CANCEL_FAULT_VOUCHER_SET, _tokenIdSupply, errObj);
    })
}

async function logVoucherDelivered() {
    VK.on(eventNames.LOG_VOUCHER_DELIVERED, async (_tokenIdSupply, _tokenIdVoucher, _issuer, _holder, _promiseId, _correlationId) => {

        let errObj = {hasError: false}
        let metadata;

        logStart(eventNames.LOG_VOUCHER_DELIVERED, _tokenIdVoucher)

        try {
            metadata = {
                _tokenIdSupply: _tokenIdSupply.toString(),
                _tokenIdVoucher: _tokenIdVoucher.toString(),
                _issuer: _issuer.toLowerCase(),
                _holder: _holder.toLowerCase(),
                _promiseId: _promiseId.toString(),
                _correlationId: _correlationId.toString(),
            }

            await axios.patch(routes.updateVoucherDelivered, metadata)

        } catch (error) {

            if (!await retryUpdateWithSuccess('patch', routes.updateVoucherDelivered, metadata, RETRIES)) {
                errObj = {
                    hasError: true,
                    error
                }

                logFinish(eventNames.LOG_VOUCHER_DELIVERED, _tokenIdVoucher, errObj)
                return
            }
        }

        try {
            metadata = {
                name: eventNames.LOG_VOUCHER_DELIVERED,
                _correlationId: _correlationId.toString(),
                address: _holder.toLowerCase()
            }

            await axios.patch(routes.updateEventByCorrId, metadata)
        } catch (error) {
            if (!await retryUpdateWithSuccess('patch', routes.updateEventByCorrId, metadata, RETRIES)) {
                errObj = {
                    hasError: true,
                    error
                }

                logFinish(eventNames.LOG_VOUCHER_DELIVERED, _tokenIdVoucher, errObj)
                return
            }
        }


        logFinish(eventNames.LOG_VOUCHER_DELIVERED, _tokenIdVoucher, errObj);

    })
}

async function logVoucherFaultCancel() {
    VK.on(eventNames.LOG_VOUCHER_CANCEL_FAULT, async (_tokenIdVoucher) => {

        let errObj = {hasError: false}
        let metadata;

        logStart(eventNames.LOG_VOUCHER_CANCEL_FAULT, _tokenIdVoucher)

        try {
            metadata = {
                _tokenIdVoucher: _tokenIdVoucher.toString(),
                [statuses.CANCELLED]: new Date().getTime(),
            }
            await axios.patch(routes.updateVoucherOnCommonEvent, metadata)

        } catch (error) {

            if (!await retryUpdateWithSuccess('patch', routes.updateVoucherOnCommonEvent, metadata, RETRIES)) {
                errObj = {
                    hasError: true,
                    error
                }
                logFinish(eventNames.LOG_VOUCHER_CANCEL_FAULT, _tokenIdVoucher, errObj)
                return
            }
        }

        try {
            metadata = {
                name: eventNames.LOG_VOUCHER_CANCEL_FAULT,
                _tokenId: _tokenIdVoucher.toString()
            }

            await axios.patch(routes.updateEventBeTokenId, metadata)
        } catch (error) {
            if (!await retryUpdateWithSuccess('patch', routes.updateEventBeTokenId, metadata, RETRIES)) {
                errObj = {
                    hasError: true,
                    error
                }

                logFinish(eventNames.LOG_VOUCHER_CANCEL_FAULT, _tokenIdVoucher, errObj)
                return
            }
        }

        logFinish(eventNames.LOG_VOUCHER_CANCEL_FAULT, _tokenIdVoucher, errObj)
    })
}

async function logVoucherComplain() {
    VK.on(eventNames.LOG_VOUCHER_COMPLAIN, async (_tokenIdVoucher) => {

        let errObj = {hasError: false}
        let metadata;

        logStart(eventNames.LOG_VOUCHER_COMPLAIN, _tokenIdVoucher)

        try {
            metadata = {
                _tokenIdVoucher: _tokenIdVoucher.toString(),
                [statuses.COMPLAINED]: new Date().getTime(),
            };

            await axios.patch(routes.updateVoucherOnCommonEvent, metadata)

        } catch (error) {

            if (!await retryUpdateWithSuccess('patch', routes.updateVoucherOnCommonEvent, metadata, RETRIES)) {
                errObj = {
                    hasError: true,
                    error
                }

                logFinish(eventNames.LOG_VOUCHER_COMPLAIN, _tokenIdVoucher, errObj)
                return
            }
        }

        try {
            metadata = {
                name: eventNames.LOG_VOUCHER_COMPLAIN,
                _tokenId: _tokenIdVoucher.toString()
            }

            await axios.patch(routes.updateEventBeTokenId, metadata)
        } catch (error) {
            if (!await retryUpdateWithSuccess('patch', routes.updateEventBeTokenId, metadata, RETRIES)) {
                errObj = {
                    hasError: true,
                    error
                }

                logFinish(eventNames.LOG_VOUCHER_COMPLAIN, _tokenIdVoucher, errObj)
                return
            }
        }

        logFinish(eventNames.LOG_VOUCHER_COMPLAIN, _tokenIdVoucher, errObj)

    })
}

async function logVoucherRedeemed() {
    VK.on(eventNames.LOG_VOUCHER_REDEEMED, async (_tokenIdVoucher, _holder) => {

        let errObj = {hasError: false}

        let metadata;

        logStart(eventNames.LOG_VOUCHER_REDEEMED, _tokenIdVoucher)

        try {
            metadata = {
                _tokenIdVoucher: _tokenIdVoucher.toString(),
                _holder: _holder.toLowerCase(),
                [statuses.REDEEMED]: new Date().getTime()
            }

            await axios.patch(routes.updateVoucherOnCommonEvent, metadata)
        } catch (error) {
            if (!await retryUpdateWithSuccess('patch', routes.updateVoucherOnCommonEvent, metadata, RETRIES)) {
                errObj = {
                    hasError: true,
                    error
                }

                logFinish(eventNames.LOG_VOUCHER_REDEEMED, _tokenIdVoucher, errObj)
                return
            }
        }

        try {
            metadata = {
                name: eventNames.LOG_VOUCHER_REDEEMED,
                _tokenId: _tokenIdVoucher.toString()
            }

            await axios.patch(routes.updateEventBeTokenId, metadata)
        } catch (error) {
            if (!await retryUpdateWithSuccess('patch', routes.updateEventBeTokenId, metadata, RETRIES)) {
                errObj = {
                    hasError: true,
                    error
                }

                logFinish(eventNames.LOG_VOUCHER_REDEEMED, _tokenIdVoucher, errObj)
                return
            }
        }

        logFinish(eventNames.LOG_VOUCHER_REDEEMED, _tokenIdVoucher, errObj)
    })
}

async function logVoucherRefunded() {
    VK.on(eventNames.LOG_VOUCHER_REFUNDED, async (_tokenIdVoucher) => {

        let errObj = {hasError: false}

        let metadata;

        logStart(eventNames.LOG_VOUCHER_REFUNDED, _tokenIdVoucher)

        try {
            metadata = {
                _tokenIdVoucher: _tokenIdVoucher.toString(),
                [statuses.REFUNDED]: new Date().getTime()
            }

            await axios.patch(routes.updateVoucherOnCommonEvent, metadata)
        } catch (error) {

            if (!await retryUpdateWithSuccess('patch', routes.updateVoucherOnCommonEvent, metadata, RETRIES)) {
                errObj = {
                    hasError: true,
                    error
                }

                logFinish(eventNames.LOG_VOUCHER_REFUNDED, _tokenIdVoucher, errObj)
                return
            }
        }

        try {
            metadata = {
                name: eventNames.LOG_VOUCHER_REFUNDED,
                _tokenId: _tokenIdVoucher.toString()
            }

            await axios.patch(routes.updateEventBeTokenId, metadata)
        } catch (error) {
            if (!await retryUpdateWithSuccess('patch', routes.updateEventBeTokenId, metadata, RETRIES)) {
                errObj = {
                    hasError: true,
                    error
                }

                logFinish(eventNames.LOG_VOUCHER_REFUNDED, _tokenIdVoucher, errObj)
                return
            }
        }

        logFinish(eventNames.LOG_VOUCHER_REFUNDED, _tokenIdVoucher, errObj)
    })
}

async function logTransfer721() {
    ERC1155721.on(eventNames.LOG_TRANSFER_721, async (_from, _to, _tokenIdVoucher) => {

        let errObj = {hasError: false}
        let metadata;

        // This is initial minting of a token from seller to buyer, not actual transfer from buyer to buyer
        if (_from.toString() == ZERO_ADDRESS) return;

        logStart(eventNames.LOG_TRANSFER_721, _tokenIdVoucher)

        try {
            const newOwnerCorrelationId = await BR.getCorrelationId(_to);

             metadata = {
                _holder: _to.toLowerCase(),
                _tokenIdVoucher: _tokenIdVoucher.toString(),
                _correlationId: newOwnerCorrelationId.toString()
            }

            await axios.patch(routes.updateVoucherOnCommonEvent, metadata)

        } catch (error) {

            if (!await retryUpdateWithSuccess('patch', routes.updateVoucherOnCommonEvent, metadata, RETRIES)) {
                errObj = {
                    hasError: true,
                    error
                }

                logFinish(eventNames.LOG_TRANSFER_721, _tokenIdVoucher, errObj)
                return
            }
        }

        try {
            metadata = {
                name: eventNames.LOG_TRANSFER_721,
                _tokenId: _tokenIdVoucher.toString()
            }

            await axios.patch(routes.updateEventBeTokenId, metadata)
        } catch (error) {
            if (!await retryUpdateWithSuccess('patch', routes.updateEventBeTokenId, metadata, RETRIES)) {
                errObj = {
                    hasError: true,
                    error
                }

                logFinish(eventNames.LOG_TRANSFER_721, _tokenIdVoucher, errObj)
                return
            }
        }

        logFinish(eventNames.LOG_TRANSFER_721, _tokenIdVoucher, errObj);
    })
}

async function logTransferSingle1155() {
    ERC1155721.on(eventNames.LOG_TRANSFER_1155_SINGLE, async (_operator, oldSupplyOwner, newSupplyOwner, _tokenIdSupply, qty) => {

        let errObj = {hasError: false}
        let metadata

        // When buyer commits a voucher the transfer is emitted twice for minting 1 x 721 and burning 1 x 1155 for the buyer and the seller respectively.
        // Not an events we want to handle
        if (oldSupplyOwner.toString() == ZERO_ADDRESS || newSupplyOwner.toString() == ZERO_ADDRESS) return;

        logStart(eventNames.LOG_TRANSFER_1155_SINGLE, _tokenIdSupply)

        try {

            const newOwnerCorrelationId = await BR.getCorrelationId(newSupplyOwner);

            metadata = {
                voucherOwner: newSupplyOwner.toLowerCase(),
                voucherSupplies: [_tokenIdSupply],
                quantities: [qty],
                _correlationId: newOwnerCorrelationId.toString()
            }

            await axios.patch(routes.updateSupplyOnTransfer, metadata)

        } catch (error) {

            if (!await retryUpdateWithSuccess('patch', routes.updateSupplyOnTransfer, metadata, RETRIES)) {
                errObj = {
                    hasError: true,
                    error
                }

                logFinish(eventNames.LOG_TRANSFER_1155_SINGLE, _tokenIdSupply, errObj)
                return
            }
        }

        try {
            metadata = {
                name: eventNames.LOG_TRANSFER_1155_SINGLE,
                _tokenId: _tokenIdSupply.toString()
            }

            await axios.patch(routes.updateEventBeTokenId, metadata)
        } catch (error) {
            if (!await retryUpdateWithSuccess('patch', routes.updateEventBeTokenId, metadata, RETRIES)) {
                errObj = {
                    hasError: true,
                    error
                }

                logFinish(eventNames.LOG_TRANSFER_1155_SINGLE, _tokenIdSupply, errObj)
                return
            }
        }

        logFinish(eventNames.LOG_TRANSFER_1155_SINGLE, _tokenIdSupply, errObj)
    })
}

async function logTransferBatch1155() {
    ERC1155721.on(eventNames.LOG_TRANSFER_1155_BATCH, async (_operator, oldSupplyOwner, newSupplyOwner, _tokenIdSupplies, quantities) => {

        let errObj = {hasError: false}
        let metadata

        // When buyer commits a voucher the transfer is emitted twice for minting 1 x 721 and burning 1 x 1155 for the buyer and the seller respectively.
        // Not an events we want to handle
        if (oldSupplyOwner.toString() == ZERO_ADDRESS || newSupplyOwner.toString() == ZERO_ADDRESS) return;

        logStart(eventNames.LOG_TRANSFER_1155_BATCH, _tokenIdSupplies)

        try {

            const newOwnerCorrelationId = await BR.getCorrelationId(newSupplyOwner);

            metadata = {
                voucherOwner: newSupplyOwner.toLowerCase(),
                voucherSupplies: _tokenIdSupplies,
                quantities: quantities,
                _correlationId: newOwnerCorrelationId.toString()
            }

            await axios.patch(routes.updateSupplyOnTransfer, metadata)

        } catch (error) {

            if (!await retryUpdateWithSuccess('patch', routes.updateSupplyOnTransfer, metadata, RETRIES)) {
                errObj = {
                    hasError: true,
                    error
                }

                logFinish(eventNames.LOG_TRANSFER_1155_BATCH, _tokenIdSupplies, errObj)
                return
            }
        }

        // TODO this will need a little rework if we are to support this from the reference app. (Event Statistics related)
        // This is not the most accurate way for detecting the record, as the corrId might change (if new tx is mined for this user) in the mean time before we get the one this relates to
        try {
            const oldOwnerCorrelationId = await BR.getCorrelationId(oldSupplyOwner);
            metadata = {
                name: eventNames.LOG_TRANSFER_1155_BATCH,
                _correlationId: oldOwnerCorrelationId.toString(),
                address: oldSupplyOwner.toLowerCase()
            }

            await axios.patch(routes.updateEventByCorrId, metadata)

        } catch (error) {
            if (!await retryUpdateWithSuccess('patch', routes.updateEventByCorrId, metadata, RETRIES)) {
                errObj = {
                    hasError: true,
                    error
                }

                logFinish(eventNames.LOG_TRANSFER_1155_BATCH, _tokenIdSupplies, errObj)
                return
            }
        }

        logFinish(eventNames.LOG_TRANSFER_1155_BATCH, _tokenIdSupplies, errObj)
    })
}

async function run() {
    await Promise.all([
        logOrderCreated(),
        logVoucherSetFaultCancel(),
        logVoucherDelivered(),
        logVoucherFaultCancel(),
        logVoucherComplain(),
        logVoucherRedeemed(),
        logVoucherRefunded(),
        logTransfer721(),
        logTransferSingle1155(),
        logTransferBatch1155()
    ])
}

module.exports = {
    init,
    run
}
