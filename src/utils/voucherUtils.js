const voucherSupplyStatus = require("./voucherSupplyStatuses");

class VoucherUtils {
  static calcVoucherSupplyStatus(startDate, expiryDate, qty) {
    const todayToMillis = new Date(Date.now()).getTime();
    const expiryToMillis = new Date(expiryDate).getTime();

    if (
      todayToMillis < startDate ||
      todayToMillis > expiryToMillis ||
      qty <= 0
    ) {
      return voucherSupplyStatus.INACTIVE;
    }

    return voucherSupplyStatus.ACTIVE;
  }
}

module.exports = VoucherUtils;
