const voucherStatus = require("./voucherStatus");

class VoucherUtils {
  static calcVoucherSupplyStatus(startDate, expiryDate, qty) {
    const todayToMillis = new Date(Date.now()).getTime();
    const expiryToMillis = new Date(expiryDate).getTime();

    if (
      todayToMillis < startDate ||
      todayToMillis > expiryToMillis ||
      qty <= 0
    ) {
      return voucherStatus.INACTIVE;
    }

    return voucherStatus.ACTIVE;
  }
}

module.exports = VoucherUtils;
