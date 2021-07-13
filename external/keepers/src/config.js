const eventNames = {
    LOG_VOUCHER_DELIVERED: 'LogVoucherDelivered',
    LOG_ORDER_CREATED: 'LogOrderCreated',
    LOG_CANCEL_FAULT_VOUCHER_SET: 'LogVoucherSetFaultCancel',
    LOG_VOUCHER_CANCEL_FAULT: 'LogVoucherFaultCancel',
    LOG_VOUCHER_COMPLAIN: 'LogVoucherComplain',
    LOG_VOUCHER_REDEEMED: 'LogVoucherRedeemed',
    LOG_VOUCHER_REFUNDED: 'LogVoucherRefunded',
    LOG_TRANSFER_721: 'Transfer',
    LOG_TRANSFER_1155_SINGLE: 'TransferSingle',
    LOG_TRANSFER_1155_BATCH: 'TransferBatch'
}

const apiUrl = process.env.API_URL

const routes = {
    createVoucherSupply: `${apiUrl}/voucher-sets/`,
    setSupplyMeta: `${apiUrl}/voucher-sets/set-supply-meta`,
    updateSupplyOnCancel: `${apiUrl}/voucher-sets/update-supply-oncancel`,
    updateSupplyOnTransfer: `${apiUrl}/voucher-sets/update-supply-ontransfer`,
    commitToBuy: `${apiUrl}/vouchers/commit-to-buy`,
    updateVoucherDelivered: `${apiUrl}/vouchers/update-voucher-delivered`,
    updateVoucherOnCommonEvent: `${apiUrl}/vouchers/update-from-common-event`,
    //events-statistics
    updateEventByCorrId: `${apiUrl}/events/update-by-correlation-id`,
    updateEventBeTokenId: `${apiUrl}/events/update-by-token-id`,
}

const statuses = {
    CANCELLED: 'CANCELLED',
    COMPLAINED: 'COMPLAINED',
    REDEEMED: 'REDEEMED',
    REFUNDED: 'REFUNDED'
}

const errors = {
    ECONNREFUSED: 'ECONNREFUSED',
    NOT_FOUND: 404,
    BAD_REQUEST: 400
}

module.exports = {
    eventNames,
    routes,
    statuses,
    errors
}