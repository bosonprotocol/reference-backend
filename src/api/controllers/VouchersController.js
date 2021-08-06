// @ts-nocheck
const ApiError = require("../ApiError");

const voucherUtils = require("../../utils/voucherUtils");

class VouchersController {
  constructor(voucherSuppliesRepository, vouchersRepository) {
    this.voucherSuppliesRepository = voucherSuppliesRepository;
    this.vouchersRepository = vouchersRepository;
  }

  async getVouchers(req, res, next) {
    const voucherData = [];
    const address = res.locals.address;
    try {
      const promises = [];
      const userVouchers = await this.vouchersRepository.getAllVouchersByHolder(
        address
      );

      userVouchers.forEach((userVoucher) => {
        promises.push(
          this.voucherSuppliesRepository.getVoucherSupplyDetails(
            userVoucher,
            voucherData
          )
        );
      });
      console.log('here voucher');
      console.log(userVouchers);
      await Promise.all(promises);
    } catch (error) {
      console.log(
        `An error occurred while tried to get all vouchers for user: ${address}!`
      );
      console.log(error.message);
      return next(
        new ApiError(400, `Error processing User Vouchers for user: ${address}`)
      );
    }

    res.status(200).send({ voucherData });
  }

  async getBoughtVouchersForSupply(req, res, next) {
    const owner = res.locals.address;
    const supplyID = req.params.supplyID;
    let vouchers = {};
    try {
      vouchers = await this.vouchersRepository.getAllVouchersByVoucherSupplyIdAndOwner(
        supplyID,
        owner
      );
    } catch (error) {
      console.log(
        `An error occurred while tried to get bought vouchers with Supply ID: [${supplyID}]!`
      );
      console.log(error.message);
      return next(
        new ApiError(400, `Error fetching all buyers for Voucher: ${supplyID}`)
      );
    }
    res.status(200).send({ vouchers });
  }

  async getVoucherDetails(req, res, next) {
    const voucherID = req.params.voucherID;

    let voucher;
    try {
      const userVoucher = await this.vouchersRepository.getVoucherById(
        voucherID
      );
      const voucherSupply = await this.voucherSuppliesRepository.getVoucherSupplyById(
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
        EXPIRED: userVoucher.EXPIRED,
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
        paymentType: voucherSupply._paymentType,
      };
    } catch (error) {
      console.log(
        `An error occurred while tried to fetch voucher details with ID: [${voucherID}]!`
      );
      console.log(error.message);
      return next(
        new ApiError(
          400,
          `Error fetching Voucher Details for voucher: ${voucherID}`
        )
      );
    }
    res.status(200).send({ voucher });
  }

  async commitToBuy(req, res, next) {
    const supplyID = req.params.supplyID;
    const metadata = req.body;
    let voucher;

    try {
      voucher = await this.vouchersRepository.createVoucher(metadata, supplyID);
    } catch (error) {
      console.log(error);
      return next(
        new ApiError(
          400,
          `Buy operation for Supply id: ${supplyID} could not be completed.`
        )
      );
    }

    res.status(200).send({ voucherID: voucher.id });
  }

  /**
   * @notice This function is triggered while event 'LogVoucherDelivered' is emitted
   */
  async updateVoucherDelivered(req, res, next) {
    let voucher;

    try {
      voucher = await this.vouchersRepository.updateVoucherDelivered(req.body);

      await this.voucherSuppliesRepository.decrementVoucherSupplyQty(
        req.body._tokenIdSupply
      );
    } catch (error) {
      console.log(error);
      return next(
        new ApiError(
          400,
          `Update operation for voucher id: ${req.body._tokenIdVoucher} could not be completed.`
        )
      );
    }

    res.status(200).send({ voucher: voucher.id });
  }

  /**
   * @notice This function is triggered while some of the following events is emitted
   *  LogVoucherRedeemed
   *  LogVoucherRefunded
   *  LogVoucherComplain
   *  LogVoucherFaultCancel
   *  Transfer (e.g ERC-721)
   */
  async updateVoucherOnCommonEvent(req, res, next) {
    let voucher;

    try {
      voucher = await this.vouchersRepository.getVoucherByVoucherTokenId(
        req.body._tokenIdVoucher
      );

      if (!voucher) {
        return next(
          new ApiError(
            404,
            `User Voucher with voucherTokenId ${req.body._tokenIdVoucher} not found!`
          )
        );
      }

      await this.vouchersRepository.updateVoucherOnCommonEvent(
        voucher.id,
        req.body
      );
    } catch (error) {
      console.log(error);
      return next(
        new ApiError(
          400,
          `Update operation for voucher id: ${voucher.id} could not be completed.`
        )
      );
    }

    res.status(200).send({ updated: true });
  }

  async updateStatusFromKeepers(req, res, next) {
    const tokenIdVoucher = req.body[0]._tokenIdVoucher;
    const status = req.body[0].status;

    try {
      await this.vouchersRepository.updateStatusFromKeepers(
        tokenIdVoucher,
        status
      );
    } catch (error) {
      console.log(
        `An error occurred while tried to finalize voucher with ID: [${tokenIdVoucher}]!`
      );
      console.log(error);
      return next(
        new ApiError(
          400,
          `Finalize operation for token voucher id: ${tokenIdVoucher} could not be completed.`
        )
      );
    }

    res.status(200).send({ updated: true });
  }

  async getAllVouchers(req, res, next) {
    let vouchers;

    try {
      vouchers = await this.vouchersRepository.getAllVouchers();
    } catch (error) {
      console.log(`An error occurred while tried to fetch all vouchers!`);
      console.log(error);
      return next(new ApiError(400, `Error fetching all vouchers.`));
    }

    res.status(200).send({ vouchers });
  }
}

module.exports = VouchersController;
