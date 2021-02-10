// @ts-nocheck

const APIError = require("../api-error");
const voucherUtils = require("../../utils/voucherUtils");
const VoucherSuppliesRepository = require("../../database/VoucherSupply/voucher-supplies-repository");
const VouchersRepository = require("../../database/Vouchers/vouchers-repository");

const voucherSuppliesRepository = new VoucherSuppliesRepository();
const vouchersRepository = new VouchersRepository();

class VoucherController {
  static async getVouchers(req, res, next) {
    const voucherData = [];
    const address = res.locals.address;

    try {
      const promises = [];
      const userVouchers = await vouchersRepository.getAllVouchersByHolder(
        address
      );

      userVouchers.forEach((userVoucher) => {
        promises.push(
          voucherSuppliesRepository.getVoucherSupplyDetails(
            userVoucher,
            voucherData
          )
        );
      });

      await Promise.all(promises);
    } catch (error) {
      console.error(
        `An error occurred while tried to get all vouchers for user: ${address}!`
      );
      console.error(error.message);
      return next(`Error processing User Vouchers for user: ${address}`);
    }

    res.status(200).send({ voucherData });
  }

  static async getBoughtVouchersForSupply(req, res, next) {
    const owner = res.locals.address;
    const supplyID = req.params.supplyID;
    let vouchers = {};
    try {
      vouchers = await vouchersRepository.getAllVouchersByVoucherSupplyIdAndOwner(
        supplyID,
        owner
      );
    } catch (error) {
      console.error(
        `An error occurred while tried to get bought vouchers with Supply ID: [${supplyID}]!`
      );
      console.error(error.message);
      return next(`Error fetching all buyers for Voucher: ${supplyID}`);
    }
    res.status(200).send({ vouchers });
  }

  static async getVoucherDetails(req, res, next) {
    const voucherID = req.params.voucherID;

    let voucher;
    try {
      const userVoucher = await vouchersRepository.getVoucherById(voucherID);
      const voucherSupply = await voucherSuppliesRepository.getVoucherSupplyById(
        userVoucher.supplyID
      );

      voucher = {
        _id: userVoucher.id,
        _tokenIdVoucher: userVoucher._tokenIdVoucher,
        _holder: userVoucher._holder,
        _tokenIdSupply: userVoucher._tokenIdSupply,
        buyerStatus: userVoucher.status,
        CANCELLED: userVoucher.CANCELLED,
        COMMITTED: userVoucher.COMMITTED,
        COMPLAINED: userVoucher.COMPLAINED,
        REDEEMED: userVoucher.REDEEMED,
        REFUNDED: userVoucher.REFUNDED,
        FINALIZED: userVoucher.FINALIZED,
        supplyID: voucherSupply.id,
        voucherStatus: voucherUtils.calcVoucherSupplyStatus(
          voucherSupply.startDate,
          voucherSupply.expiryDate,
          voucherSupply.qty
        ),
        title: voucherSupply.title,
        qty: voucherSupply.qty,
        description: voucherSupply.description,
        location: voucherSupply.location,
        contact: voucherSupply.contact,
        conditions: voucherSupply.conditions,
        imagefiles: voucherSupply.imagefiles,
        category: voucherSupply.category,
        startDate: voucherSupply.startDate,
        expiryDate: voucherSupply.expiryDate,
        price: voucherSupply.price,
        buyerDeposit: voucherSupply.buyerDeposit,
        sellerDeposit: voucherSupply.sellerDeposit,
        voucherOwner: voucherSupply.voucherOwner,
      };
    } catch (error) {
      console.error(
        `An error occurred while tried to fetch voucher details with ID: [${voucherID}]!`
      );
      console.error(error.message);
      return next(`Error fetching Voucher Details for voucher: ${voucherID}`);
    }

    res.status(200).send({ voucher });
  }

  static async updateVoucher(req, res, next) {
    const voucherID = res.locals.userVoucher.id;
    const status = req.body.status;

    try {
      await vouchersRepository.updateVoucherStatus(voucherID, status);
    } catch (error) {
      console.error(
        `An error occurred while tried to update voucher with ID: [${voucherID}]!`
      );
      console.error(error);
      return next(
        new APIError(
          400,
          `UPDATE operation for voucher id: ${voucherID} could not be completed.`
        )
      );
    }

    res.status(200).send({ updated: true });
  }

  static async finalizeVoucher(req, res, next) {
    const tokenIdVoucher = req.body[0]._tokenIdVoucher;
    const status = req.body[0].status;

    try {
      await vouchersRepository.finalizeVoucher(tokenIdVoucher, status);
    } catch (error) {
      console.error(
        `An error occurred while tried to finalize voucher with ID: [${tokenIdVoucher}]!`
      );
      console.error(error);
      return next(
        new APIError(
          400,
          `Finalize operation for token voucher id: ${tokenIdVoucher} could not be completed.`
        )
      );
    }

    res.status(200).send({ updated: true });
  }

  static async getAllVouchers(req, res, next) {
    let vouchers;

    try {
      vouchers = await vouchersRepository.getAllVouchers();
    } catch (error) {
      console.error(`An error occurred while tried to fetch all vouchers!`);
      console.error(error);
      return next(new APIError(400, `Error fetching all vouchers.`));
    }

    res.status(200).send({ vouchers });
  }
}

module.exports = VoucherController;
