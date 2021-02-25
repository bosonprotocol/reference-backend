// @ts-nocheck
const ApiError = require("../ApiError");

const voucherUtils = require("../../utils/voucherUtils");

class VoucherSuppliesController {
  constructor(voucherSuppliesRepository) {
    this.voucherSuppliesRepository = voucherSuppliesRepository;
  }

  async getVoucherSupply(req, res, next) {
    let voucherSupply;

    if (typeof req.params.id === "undefined") {
      console.error(`An error occurred while tried to fetch Voucher.`);
      return next(new ApiError(400, "No VoucherID was presented"));
    }

    try {
      voucherSupply = await this.voucherSuppliesRepository.getVoucherSupplyById(
        req.params.id
      );
      voucherSupply.voucherStatus = voucherUtils.calcVoucherSupplyStatus(
        voucherSupply.startDate,
        voucherSupply.expiryDate,
        voucherSupply.qty
      );
    } catch (error) {
      console.error(
        `An error occurred while tried to fetch Voucher Supply with ID: [${req.params.id}].`
      );
      console.error(error);
      return next(
        new ApiError(400, `Could not get voucher with ID: ${req.params.id}`)
      );
    }

    res.status(200).send({
      voucherSupply,
    });
  }

  async getAllVoucherSupplies(req, res, next) {
    let voucherSupplies;

    try {
      voucherSupplies = await this.voucherSuppliesRepository.getAllVoucherSupplies();
    } catch (error) {
      console.error(
        `An error occurred while tried to fetch all voucher supplies!`
      );
      console.error(error);
      return next(new ApiError(400, `Error fetching all voucher supplies.`));
    }

    res.status(200).send({ voucherSupplies });
  }

  async getSellerSupplies(req, res, next) {
    let voucherSupplies;
    const owner = req.params.address.toLowerCase();

    try {
      voucherSupplies = await this.voucherSuppliesRepository.getAllVoucherSuppliesByOwner(
        owner
      );

      voucherSupplies.forEach((supply) => {
        supply.voucherStatus = voucherUtils.calcVoucherSupplyStatus(
          supply.startDate,
          supply.expiryDate,
          supply.qty
        );
      });
    } catch (error) {
      console.error(
        `An error occurred while user [${owner}] tried to fetch Vouchers.`
      );
      console.error(error);
      return next(new ApiError(400, "Invalid operation"));
    }

    res.status(200).send({ voucherSupplies });
  }

  async getBuyerSupplies(req, res, next) {
    let voucherSupplies;
    const buyer = req.params.address.toLowerCase();

    try {
      voucherSupplies = await this.voucherSuppliesRepository.getActiveVoucherSuppliesByOwner(
        buyer
      );
    } catch (error) {
      console.error(
        `An error occurred while user [${buyer}] tried to fetch Vouchers.`
      );
      console.error(error);
      return next(new ApiError(400, "Invalid operation"));
    }

    res.status(200).send({ voucherSupplies });
  }

  async getSupplyStatuses(req, res, next) {
    let active,
      inactive = [];
    const address = res.locals.address;

    try {
      active = await this.voucherSuppliesRepository.getActiveVoucherSuppliesByOwner(
        address
      );
      inactive = await this.voucherSuppliesRepository.getInactiveVoucherSuppliesByOwner(
        address
      );
    } catch (error) {
      console.error(
        `An error occurred while user tried to fetch Supply Statuses.`
      );
      console.error(error);
      return next(new ApiError(400, "Bad request."));
    }

    res.status(200).send({ active: active.length, inactive: inactive.length });
  }

  async getActiveSupplies(req, res, next) {
    let active = [];
    const address = res.locals.address;

    try {
      active = await this.voucherSuppliesRepository.getActiveVoucherSuppliesByOwner(
        address
      );
    } catch (error) {
      console.error(
        `An error occurred while user tried to fetch Active Supplies.`
      );
      console.error(error);
      return next(new ApiError(400, "Bad request."));
    }

    res.status(200).send({
      voucherSupplies: active,
    });
  }

  async getInactiveSupplies(req, res, next) {
    let inActive = [];
    const address = res.locals.address;

    try {
      inActive = await this.voucherSuppliesRepository.getInactiveVoucherSuppliesByOwner(
        address
      );
    } catch (error) {
      console.error(error);
      return next(new ApiError(400, "Bad request."));
    }

    res.status(200).send({
      voucherSupplies: inActive,
    });
  }

  async createVoucherSupply(req, res, next) {
    const fileRefs = req.fileRefs;
    const voucherOwner = res.locals.address;
    let voucherSupply;

    try {
      voucherSupply = await this.voucherSuppliesRepository.createVoucherSupply(
        req.body,
        fileRefs,
        voucherOwner
      );
    } catch (error) {
      console.error(
        `An error occurred while user [${voucherOwner}] tried to create Voucher.`
      );
      console.error(error.errors);
      return next(new ApiError(400, "Invalid voucher model"));
    }

    res.status(201).send({ voucherSupply });
  }

  async updateVoucherSupply(req, res, next) {
    const fileRefs = req.fileRefs;
    const voucherOwner = res.locals.address;
    const voucher = res.locals.voucherSupply;

    try {
      await this.voucherSuppliesRepository.updateVoucherSupply(
        voucher,
        req.body,
        fileRefs
      );
    } catch (error) {
      console.error(
        `An error occurred while user [${voucherOwner}] tried to update Voucher.`
      );
      console.error(error);
      return next(new ApiError(400, "Invalid voucher model"));
    }

    res.status(200).send({ success: true });
  }

  async deleteVoucherSupply(req, res, next) {
    const voucherSupply = res.locals.voucherSupply;

    try {
      await this.voucherSuppliesRepository.deleteVoucherSupply(
        voucherSupply.id
      );
    } catch (error) {
      console.error(
        `An error occurred while user [${req.body.voucherOwner}] tried to delete Voucher.`
      );
      return next(new ApiError(400, "Invalid operation"));
    }

    res.status(200).send({ success: true });
  }

  async deleteImage(req, res, next) {
    const voucherSupply = res.locals.voucherSupply;
    const imageUrl = req.body.imageUrl;

    try {
      await this.voucherSuppliesRepository.deleteVoucherSupplyImage(
        voucherSupply.id,
        imageUrl
      );
    } catch (error) {
      console.error(
        `An error occurred while image from document [${req.params.id}] was tried to be deleted.`
      );
      console.error(error);
      return next(new ApiError(400, "Invalid operation"));
    }

    res.status(200).send({ success: true });
  }
}

module.exports = VoucherSuppliesController;
