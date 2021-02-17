const VOUCHER_STATUS = require("./voucherStatus");

class VoucherUtils {
  static calcVoucherSupplyStatus(startDate, expiryDate, qty) {
    const todayToMillis = new Date(Date.now()).getTime();
    const expiryToMillis = new Date(expiryDate).getTime();

    if (
      todayToMillis < startDate ||
      todayToMillis > expiryToMillis ||
      qty <= 0
    ) {
      return VOUCHER_STATUS.INACTIVE;
    }

    return VOUCHER_STATUS.ACTIVE;
  }
}

module.exports = VoucherUtils;
