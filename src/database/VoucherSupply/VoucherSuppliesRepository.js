// @ts-nocheck
const VoucherSupply = require("../models/VoucherSupply");

const standardFields = [
  "voucherOwner",
  "title",
  "price",
  "description",
  "imagefiles",
  "expiryDate",
  "startDate",
  "qty",
  "visible",
];

// TODO: Rename to VoucherSet/VoucherSets throughout
// TODO: Rename qty to quantity, no need for abbreviation
// TODO: Rename _tokenIdSupply to _supplyTokenId?
// TODO: Discuss lowercase owner address consistency
class VoucherSuppliesRepository {
  async createVoucherSupply(metadata, fileRefs, voucherOwner) {
    const voucherSupply = new VoucherSupply({
      title: metadata.title,
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
      blockchainAnchored: false,
      _correlationId: metadata._correlationId,
      _tokenIdSupply: metadata._tokenIdSupply,
      imagefiles: fileRefs,
      _paymentType: metadata._paymentType,
    });

    return voucherSupply.save();
  }

  async updateVoucherSupply(voucherSupply, metadata, fileRefs) {
    const currentOwner = voucherSupply.voucherOwner;
    const currentVisibility = voucherSupply.visible;
    const currentSupplyTokenId = voucherSupply._tokenIdSupply;
    const currentImages = voucherSupply.imagefiles;
    const updatedImages = [...currentImages, ...fileRefs];

    await VoucherSupply.findByIdAndUpdate(
      voucherSupply.id,
      {
        title: metadata.title,
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
        imagefiles: updatedImages,
        voucherOwner: currentOwner,
        visible: currentVisibility,
        _tokenIdSupply: currentSupplyTokenId,
      },
      { useFindAndModify: false, new: true, upsert: true }
    );
  }

  async decrementVoucherSupplyQty(supplyId) {
    const voucherSupply = await this.getVoucherSupplyBySupplyTokenId(supplyId);
    if (!voucherSupply) {
      throw new Error("Voucher supply not found");
    }

    voucherSupply.qty = --voucherSupply.qty;

    return await voucherSupply.save();
  }

  async setVoucherSupplyMeta(metadata) {
    let voucherSupply = await VoucherSupply.findOne({
      voucherOwner: metadata.voucherOwner,
      _correlationId: metadata._correlationId,
    });

    voucherSupply._tokenIdSupply = metadata._tokenIdSupply;
    voucherSupply._paymentType = metadata._paymentType;
    voucherSupply._promiseId = metadata._promiseId;
    voucherSupply.qty = metadata.qty;
    voucherSupply.startDate = metadata.validFrom;
    voucherSupply.expiryDate = metadata.validTo;
    voucherSupply.price = metadata.price;
    voucherSupply.buyerDeposit = metadata.buyerDeposit;
    voucherSupply.sellerDeposit = metadata.sellerDeposit;
    voucherSupply.blockchainAnchored = true;

    return await voucherSupply.save();
  }

  async updateSupplyMeta(metadata) {
    const voucherSupply = await VoucherSupply.findOne(
      {
        _tokenIdSupply: metadata._tokenIdSupply,
      },
      { new: true, upsert: true }
    );

    if (!voucherSupply) {
      throw new Error(
        `Voucher Supply for update with id: ${metadata._tokenIdSupply} not found!`
      );
    }

    return VoucherSupply.findByIdAndUpdate(voucherSupply.id, {
      ...metadata,
    });
  }

  async toggleVoucherSupplyVisibility(id) {
    const voucherSupply = await this.getVoucherSupplyById(id);
    if (!voucherSupply) {
      throw new Error("Voucher supply not found");
    }

    return VoucherSupply.findByIdAndUpdate(
      id,
      {
        visible: !voucherSupply.visible,
      },
      { useFindAndModify: false, new: true }
    );
  }

  async deleteVoucherSupply(id) {
    const voucherSupply = await this.getVoucherSupplyById(id);
    if (!voucherSupply) {
      throw new Error("Voucher supply not found");
    }

    await VoucherSupply.findByIdAndDelete(id);
  }

  async deleteVoucherSupplyImage(id, imageUrl) {
    const voucherSupply = await this.getVoucherSupplyById(id);
    if (!voucherSupply) {
      throw new Error("Voucher supply not found");
    }

    const currentImages = voucherSupply.imagefiles;
    const updatedImages = currentImages.filter(
      (image) => image.url !== imageUrl
    );

    await VoucherSupply.findByIdAndUpdate(
      id,
      {
        imagefiles: updatedImages,
      },
      { useFindAndModify: false, new: true }
    );
  }

  async getVoucherSupplyById(id) {
    return VoucherSupply.findById(id);
  }

  async getVoucherSupplyByOwnerAndCorrelationId(metadata) {
    return VoucherSupply.findOne({
      voucherOwner: metadata.voucherOwner,
      _correlationId: metadata._correlationId,
    });
  }

  async getVoucherSupplyBySupplyTokenId(supplyTokenId) {
    return VoucherSupply.findOne({ _tokenIdSupply: supplyTokenId });
  }

  async getAllVoucherSupplies() {
    return VoucherSupply.find({});
  }

  async getAllVoucherSuppliesByOwner(owner) {
    return VoucherSupply.where("voucherOwner")
      .equals(owner)
      .select(standardFields)
      .sort({ offeredDate: "desc" })
      .lean();
  }

  async getActiveVoucherSuppliesByOwner(owner) {
    const today = new Date(Date.now());

    return VoucherSupply.where("voucherOwner")
      .equals(owner.toLowerCase())
      .where("startDate")
      .lte(today)
      .where("expiryDate")
      .gte(today)
      .where("qty")
      .gt(0)
      .select(standardFields)
      .sort({ offeredDate: "desc" })
      .lean();
  }

  async getInactiveVoucherSuppliesByOwner(owner) {
    const today = new Date(Date.now());

    return VoucherSupply.where("voucherOwner")
      .equals(owner.toLowerCase())
      .or([
        { startDate: { $gte: today } },
        { expiryDate: { $lte: today } },
        { qty: { $lte: 0 } },
      ])
      .select(standardFields)
      .sort({ offeredDate: "desc" })
      .lean();
  }

  async getVoucherSupplyDetails(voucher, voucherSupplyDetailsList) {
    const voucherSupply = await this.getVoucherSupplyById(voucher.supplyID);
    if (!voucherSupply) {
      // if we are to support vouchers, committed outside of the reference-app - they would not get a supplyID, hence the whole collection with VoucherSupplyDetails would not be returned, if we throw an error.
      return;
    }

    const voucherSupplyDetails = {
      _id: voucher.id,
      title: voucherSupply.title,
      qty: voucherSupply.qty,
      description: voucherSupply.description,
      imagefiles: voucherSupply.imagefiles,
      category: voucherSupply.category,
      price: voucherSupply.price,
      expiryDate: voucherSupply.expiryDate,
      visible: voucherSupply.visible,
      CANCELLED: voucher.CANCELLED,
      COMMITTED: voucher.COMMITTED,
      COMPLAINED: voucher.COMPLAINED,
      EXPIRED: voucher.EXPIRED,
      FINALIZED: voucher.FINALIZED,
      REDEEMED: voucher.REDEEMED,
      REFUNDED: voucher.REFUNDED,
    };

    voucherSupplyDetailsList.push(voucherSupplyDetails);
  }
}

module.exports = VoucherSuppliesRepository;
