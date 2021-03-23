const Voucher = require("../models/Voucher");
const voucherStatuses = require("../../utils/voucherStatuses");

// TODO: Rename supplyID to supplyId to match other IDs.
// TODO: Discuss lowercase owner address consistency
// TODO: Discuss lowercase holder address consistency
class VouchersRepository {
  async createVoucher(metadata, voucherSupplyId) {
    const voucher = new Voucher({
      supplyID: voucherSupplyId,
      _holder: metadata._holder.toLowerCase(),
      _tokenIdSupply: metadata._tokenIdSupply,
      _tokenIdVoucher: metadata._tokenIdVoucher,
      [voucherStatuses.COMMITTED]: new Date().getTime(),
      [voucherStatuses.CANCELLED]: null,
      [voucherStatuses.COMPLAINED]: null,
      [voucherStatuses.REDEEMED]: null,
      [voucherStatuses.REFUNDED]: null,
      [voucherStatuses.EXPIRED]: null,
      [voucherStatuses.FINALIZED]: null,
      voucherOwner: metadata._issuer.toLowerCase(),
      actionDate: new Date().getTime(),
      _correlationId: metadata._correlationId,
      blockchainAnchored: false,
    });

    return voucher.save();
  }

  async updateVoucherDelivered(metadata) {
    const voucher = await Voucher.findOne({
      _correlationId: metadata._correlationId,
      _holder: metadata._holder.toLowerCase(),
      _tokenIdSupply: metadata._tokenIdSupply,
    });

    voucher._tokenIdVoucher = metadata._tokenIdVoucher;
    voucher._promiseId = metadata._promiseId;
    voucher.voucherOwner = metadata._issuer;
    voucher.blockchainAnchored = true;

    return await voucher.save();
  }

  async updateVoucherOnCommonEvent(voucherID, metadata) {
    return Voucher.findByIdAndUpdate(
      voucherID,
      {
        ...metadata,
      },
      { new: true, upsert: true }
    );
  }

  async updateStatusFromKeepers(voucherTokenId, status) {
    const voucher = await this.getVoucherByVoucherTokenId(voucherTokenId);
    if (!voucher) {
      throw new Error("Voucher not found");
    }

    voucher[status] = Date.now();
    return await voucher.save();
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

  async getVoucherByOwnerAndCorrelationId(metadata) {
    return Voucher.findOne({
      _holder: metadata._holder,
      _correlationId: metadata._correlationId,
    });
  }
}

module.exports = VouchersRepository;
