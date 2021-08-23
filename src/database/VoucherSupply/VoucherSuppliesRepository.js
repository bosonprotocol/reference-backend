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
  "_paymentType",
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
      location: {
        country: metadata.location.country,
        city: metadata.location.city,
        addressLineOne: metadata.location.addressLineOne,
        addressLineTwo: metadata.location.addressLineTwo,
        postcode: metadata.location.postcode,
      },
      contact: metadata.contact,
      conditions: metadata.conditions,
      txHash: metadata.txHash,
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
        title: metadata.title ? metadata.title : voucherSupply.title,
        qty: metadata.qty ? metadata.qty : voucherSupply.qty,
        category: metadata.category
          ? metadata.category
          : voucherSupply.category,
        startDate: metadata.startDate
          ? metadata.startDate
          : voucherSupply.startDate,
        expiryDate: metadata.expiryDate
          ? metadata.expiryDate
          : voucherSupply.expiryDate,
        offeredDate: metadata.offeredDate
          ? metadata.offeredDate
          : voucherSupply.offeredDate,
        price: metadata.price ? metadata.price : voucherSupply.price,
        buyerDeposit: metadata.buyerDeposit
          ? metadata.buyerDeposit
          : voucherSupply.buyerDeposit,
        sellerDeposit: metadata.sellerDeposit
          ? metadata.sellerDeposit
          : voucherSupply.sellerDeposit,
        description: metadata.description
          ? metadata.description
          : voucherSupply.description,
        location: {
          country: metadata.location.country
            ? metadata.location.country
            : voucherSupply.location.country,
          city: metadata.location.city
            ? metadata.location.city
            : voucherSupply.location.city,
          addressLineOne: metadata.location.addressLineOne
            ? metadata.location.addressLineOne
            : voucherSupply.location.addressLineOne,
          addressLineTwo: metadata.location.addressLineTwo
            ? metadata.location.addressLineTwo
            : voucherSupply.location.addressLineTwo,
          postcode: metadata.location.postcode
            ? metadata.location.postcode
            : voucherSupply.location.postcode,
        },
        contact: metadata.contact ? metadata.contact : voucherSupply.contact,
        conditions: metadata.conditions
          ? metadata.conditions
          : voucherSupply.conditions,
        imagefiles: updatedImages,
        voucherOwner: currentOwner,
        visible: currentVisibility,
        _tokenIdSupply: currentSupplyTokenId,
      },
      { useFindAndModify: false, new: true, upsert: true }
    );
  }

  async decrementVoucherSupplyQty(supplyId, session = null) {
    const voucherSupply = await this.getVoucherSupplyBySupplyTokenId(
      supplyId,
      session
    );

    if (!voucherSupply) {
      throw new Error("Voucher supply not found");
    }


    return await VoucherSupply.findOneAndUpdate(
      { txHash: voucherSupply.txHash },
      {
        $set: {
          qty: voucherSupply.qty - 1,
        },
      },
      { runValidators: true, session: session }
    );

  }

  async setVoucherSupplyMeta(metadata) {
    let voucherSupply = await VoucherSupply.findOne({
      txHash: metadata.txHash,
    });

    if (!voucherSupply) {
      throw new Error(
        `Voucher Supply with ID ${metadata._tokenIdSupply} does not exist!`
      );
    }

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

  async getVoucherSupplyBySupplyTokenId(supplyTokenId, session) {
    return VoucherSupply.findOne({ _tokenIdSupply: supplyTokenId }, null, {
      session: session,
    });
  }

  async getAllVoucherSupplies() {
    return VoucherSupply.find({ blockchainAnchored: true });
  }

  async getAllVoucherSuppliesByOwner(owner) {
    return VoucherSupply.where("voucherOwner")
      .equals(owner)
      .where("blockchainAnchored")
      .equals(true)
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
      .where("blockchainAnchored")
      .equals(true)
      .select(standardFields)
      .sort({ offeredDate: "desc" })
      .lean();
  }

  async getInactiveVoucherSuppliesByOwner(owner) {
    const today = new Date(Date.now());

    return VoucherSupply.where("voucherOwner")
      .equals(owner.toLowerCase())
      .where("blockchainAnchored")
      .equals(true)
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
      paymentType: voucherSupply._paymentType,
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
