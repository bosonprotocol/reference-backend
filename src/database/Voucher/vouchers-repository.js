const Voucher = require("../models/Voucher");
const status = require("../../utils/userVoucherStatus");

// TODO: Rename supplyID to supplyId to match other IDs.
// TODO: Discuss lowercase owner address consistency
// TODO: Discuss lowercase holder address consistency
class VouchersRepository {
  async createVoucher(metadata, voucherSupplyId) {
    return Voucher.findOneAndUpdate(
      { _tokenIdVoucher: metadata._tokenIdVoucher },
      {
        supplyID: voucherSupplyId,
        _holder: metadata._holder.toLowerCase(),
        _tokenIdSupply: metadata._tokenIdSupply,
        _tokenIdVoucher: metadata._tokenIdVoucher,
        [status.COMMITTED]: new Date().getTime(),
        [status.CANCELLED]: null,
        [status.COMPLAINED]: null,
        [status.REDEEMED]: null,
        [status.REFUNDED]: null,
        [status.EXPIRED]: null,
        [status.FINALIZED]: null,
        voucherOwner: metadata._issuer.toLowerCase(),
        actionDate: new Date().getTime(),
        _correlationId: metadata._correlationId,
      },
      { new: true, upsert: true, runValidators: true }
    );
  }

  async updateVoucherDelivered(metadata) {
    return Voucher.findOneAndUpdate(
      {
        _correlationId: metadata._correlationId,
        _holder: metadata._holder.toLowerCase(),
        _tokenIdSupply: metadata._tokenIdSupply,
      },
      {
        _tokenIdVoucher: metadata._tokenIdVoucher,
        _promiseId: metadata._promiseId,
        voucherOwner: metadata._issuer,
      },
      { new: true, upsert: true }
    );
  }

  static async updateVoucherOnCommonEvent(voucherID, metadata) {
    return Voucher.findByIdAndUpdate(
      voucherID,
      {
        ...metadata,
      },
      { new: true, upsert: true }
    );
  }

  // TODO below functions actually are doind the same, we should update as per
  //  collectionId, voucherId so we avoid duplication of functions
  async updateVoucherStatus(voucherId, status) {
    const voucher = await this.getVoucherById(voucherId);
    if (!voucher) {
      throw new Error("Voucher not found");
    }
    return Voucher.findByIdAndUpdate(
      voucherId,
      {
        [status]: new Date().getTime(),
      },
      { useFindAndModify: false, new: true }
    );
  }

  async updateStatusFromKeepers(voucherTokenId, status) {
    const voucher = await this.getVoucherByVoucherTokenId(voucherTokenId);
    if (!voucher) {
      throw new Error("Voucher not found");
    }
    return Voucher.findOneAndUpdate(
      { _tokenIdVoucher: voucherTokenId },
      {
        [status]: new Date().getTime(),
      },
      { useFindAndModify: false, new: true }
    );
  }

  async getAllVouchers() {
    return Voucher.find({});
  }

  async getAllVouchersByVoucherSupplyIdAndOwner(voucherSupplyId, owner) {
    return Voucher.where("supplyID")
      .equals(voucherSupplyId)
      .where("voucherOwner")
      .equals(owner);
    // removed for POC to be able to show table with statuses when cancel or fault is executed
    // .where(status.CANCELLED).equals('')
  }

  async getAllVouchersByHolder(holder) {
    return Voucher.find({ _holder: holder }).sort({
      actionDate: "desc",
    });
  }

  async getVoucherById(voucherID) {
    return Voucher.findById(voucherID);
  }

  async getVoucherByVoucherTokenId(voucherTokenId) {
    return Voucher.findOne({ _tokenIdVoucher: voucherTokenId });
  }
}

module.exports = VouchersRepository;
