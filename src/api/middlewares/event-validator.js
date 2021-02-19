const APIError = require("../api-error");
const { BigNumber } = require("ethers");

class EventValidator {
  static async ValidateUserVoucherMetadata(req, res, next) {
    if (!req.body) {
      console.error("Empty body sent while, trying to update a user voucher!");
      return next(new APIError(400, "Bad request."));
    }

    if (
      !Object.prototype.hasOwnProperty.call(req.body, "_tokenIdVoucher") ||
      !req.body._tokenIdVoucher
    ) {
      console.error("_tokenIdVoucher is empty!");
      return next(new APIError(400, "Bad request."));
    }

    next();
  }

  // ERC1155 TransferSingle / TransferBatch Validation
  static async ValidateVoucherMetadataOnTransfer(req, res, next) {
    const metadata = req.body;

    if (!metadata) {
      console.error("Empty body sent while, trying to update a voucher!");
      return next(new APIError(400, "Bad request."));
    }

    if (
      !Object.prototype.hasOwnProperty.call(metadata, "voucherSupplies") ||
      !metadata.voucherSupplies.length
    ) {
      console.error("Does not have voucherSupplies to update");
      return next(new APIError(400, "Bad request."));
    }

    if (!Object.prototype.hasOwnProperty.call(metadata, "_correlationId")) {
      console.error("Does not have _correlationId to update");
      return next(new APIError(400, "Bad request."));
    }

    try {
      BigNumber.from(metadata._correlationId);
    } catch (error) {
      console.error("Tx ID cannot be casted to BN!");
      return next(new APIError(400, "Bad request."));
    }

    next();
  }

  static async ValidateVoucherMetadata(req, res, next) {
    if (!req.body) {
      console.error("Empty body sent while, trying to update a user voucher!");
      return next(new APIError(400, "Bad request."));
    }

    /*eslint no-prototype-builtins: "error"*/
    if (
      !Object.prototype.hasOwnProperty.call(req.body, "_tokenIdSupply") ||
      !req.body._tokenIdSupply
    ) {
      console.error("_tokenIdSupply is missing!");
      return next(new APIError(400, "Bad request."));
    }

    next();
  }
}

module.exports = EventValidator;
