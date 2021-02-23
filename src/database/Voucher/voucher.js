const Voucher = require("../models/Voucher");
const status = require("../../utils/userVoucherStatus");

class VouchersService {
  static async createVoucher(metadata, supplyID) {
    return await Voucher.findOneAndUpdate(
      { _tokenIdVoucher: metadata._tokenIdVoucher },
      {
        supplyID: supplyID,
        _holder: metadata._holder.toLowerCase(),
        _tokenIdSupply: metadata._tokenIdSupply,
        _tokenIdVoucher: metadata._tokenIdVoucher,
        [status.COMMITTED]: new Date().getTime(),
        [status.CANCELLED]: "",
        [status.COMPLAINED]: "",
        [status.REDEEMED]: "",
        [status.REFUNDED]: "",
        [status.FINALIZED]: "",
        [status.EXPIRED]: "",
        voucherOwner: metadata._issuer.toLowerCase(),
        actionDate: new Date().getTime(),
        _correlationId: metadata._correlationId
      },
      { new: true, upsert: true }
    );
  }

  static async updateVoucherDelivered(metadata) {
    return await Voucher.findOneAndUpdate(
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

  static async getUserVouchers(userAddress) {
    return await Voucher.find({ _holder: userAddress }).sort({
      actionDate: "desc",
    });
  }

  static async getVoucherByID(voucherID) {
    return await Voucher.findById(voucherID);
  }

  static async findVoucherById(myVoucherId) {
    return await Voucher.findById(myVoucherId);
  }

  static async getVoucher(id) {
    return await Voucher.findById(id);
  }

  static async findVoucherByTokenIdVoucher(id) {
    return await Voucher.findOne({ _tokenIdVoucher: id });
  }

  static async findAllVouchersByVoucherSupplyID(supplyID, owner) {
    return await Voucher.where("supplyID")
      .equals(supplyID)
      .where("voucherOwner")
      .equals(owner);
    // removed for POC to be able to show table with statuses when cancel or fault is executed
    // .where(status.CANCELLED).equals('')
  }

  static async updateVoucherOnCommonEvent(voucherID, metadata) {
    return await Voucher.findByIdAndUpdate(
      voucherID,
      {
        ...metadata,
      },
      { new: true, upsert: true }
    );
  }

  // TODO below functions actually are doind the same, we should update as per collectionId, voucherId so we avoid duplication of functions
  static async updateVoucherStatus(voucherID, status) {
    return await Voucher.findByIdAndUpdate(
      voucherID,
      {
        [status]: new Date().getTime(),
      },
      { useFindAndModify: false, new: true, upsert: true }
    );
  }

  static async updateStatusFromKeepers(tokenID, status) {
    return await Voucher.findOneAndUpdate(
      { _tokenIdVoucher: tokenID },
      {
        [status]: new Date().getTime(),
      },
      { useFindAndModify: false, new: true, upsert: true }
    );
  }

  static async getAllVouchers() {
    return Voucher.find({});
  }
}

module.exports = VouchersService;
