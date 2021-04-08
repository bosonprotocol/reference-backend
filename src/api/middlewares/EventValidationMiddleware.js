const ApiError = require("../ApiError");
const { BigNumber } = require("ethers");

class EventValidationMiddleware {

  constructor(eventRepository) {
    this.eventRepository = eventRepository;
  }

  async validateUserVoucherMetadata(req, res, next) {
    if (!req.body) {
      console.error("Empty body sent while, trying to update a user voucher!");
      return next(new ApiError(400, "Bad request."));
    }

    if (
      !Object.prototype.hasOwnProperty.call(req.body, "_tokenIdVoucher") ||
      !req.body._tokenIdVoucher
    ) {
      console.error("_tokenIdVoucher is empty!");
      return next(new ApiError(400, "Bad request."));
    }

    next();
  }

  // ERC1155 TransferSingle / TransferBatch Validation
  async validateVoucherMetadataOnTransfer(req, res, next) {
    const metadata = req.body;

    if (!metadata || Object.keys(metadata).length === 0) {
      console.error("Empty body sent while, trying to update a voucher!");
      return next(new ApiError(400, "Bad request."));
    }

    if (!metadata.voucherOwner) {
      console.error("Does not have voucherOwner field!");
      return next(new ApiError(400, "Bad request."));
    }

    if (
      !Object.prototype.hasOwnProperty.call(metadata, "voucherSupplies") ||
      !metadata.voucherSupplies ||
      !metadata.voucherSupplies.length
    ) {
      console.error("Does not have voucherSupplies to update");
      return next(new ApiError(400, "Bad request."));
    }

    if (!Object.prototype.hasOwnProperty.call(metadata, "_correlationId")) {
      console.error("Does not have _correlationId to update");
      return next(new ApiError(400, "Bad request."));
    }

    try {
      BigNumber.from(metadata._correlationId);
    } catch (error) {
      console.error("Tx ID cannot be casted to BN!");
      return next(new ApiError(400, "Bad request."));
    }

    next();
  }

  async validateVoucherMetadata(req, res, next) {
    if (!req.body || Object.keys(req.body).length === 0) {
      console.error("Empty body sent while, trying to update a user voucher!");
      return next(new ApiError(400, "Bad request."));
    }

    /*eslint no-prototype-builtins: "error"*/
    if (
      !Object.prototype.hasOwnProperty.call(req.body, "_tokenIdSupply") ||
      !req.body._tokenIdSupply
    ) {
      console.error("_tokenIdSupply is missing!");
      return next(new ApiError(400, "Bad request."));
    }

    next();
  }

  async validateEventExistsByCorrelationId(req, res, next) {
    let event;

    try {
      const metadata = {
        eventName: req.body.eventName,
        _correlationId: req.body._correlationId,
        address: req.body.address.toLowerCase()
      }

      event = await this.eventRepository.findByCorrelationId(metadata)
    } catch (error) {
      console.log(error.message);
      return next(new ApiError(400, "Bad request."));
    }

    res.locals.event = event;
    next()
  }

  async validateEventExistsByTokenId(req, res, next) {
    let event;

    try {
      const metadata = {
        eventName: req.body.eventName,
        _tokenId: req.body._tokenId
      }
      
      event = await this.eventRepository.findByTokenId(metadata)
    } catch (error) {
      console.log(error.message);
      return next(new ApiError(400, "Bad request."));
    }

    res.locals.event = event;
    next()
  }
}

module.exports = EventValidationMiddleware;
