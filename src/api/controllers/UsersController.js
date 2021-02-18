const ApiError = require("../ApiError");

const nonceUtils = require("../../utils/nonceUtils");

class UsersController {
  constructor(
    authenticationService,
    usersRepository,
    voucherSuppliesRepository,
    vouchersRepository
  ) {
    this.authenticationService = authenticationService;
    this.usersRepository = usersRepository;
    this.voucherSuppliesRepository = voucherSuppliesRepository;
    this.vouchersRepository = vouchersRepository;
  }

  async generateNonce(req, res, next) {
    const address = req.params.address;
    let randomNonce;

    try {
      randomNonce = nonceUtils.generateRandomNumber();
      await this.usersRepository.preserveNonce(
        address.toLowerCase(),
        randomNonce
      );
    } catch (error) {
      console.error(error);
      return next(
        new ApiError(400, `Could not preserve nonce for user: ${address}.`)
      );
    }

    res.status(200).json(randomNonce);
  }

  async verifySignature(req, res, next) {
    const address = req.params.address;

    try {
      const nonce = await this.usersRepository.getNonce(address.toLowerCase());

      const message = {
        value: `Authentication message: ${nonce}`,
      };

      const isSignatureVerified = this.authenticationService.isSignatureVerified(
        address,
        req.body.domain,
        req.body.types,
        message,
        req.body.signature
      );

      if (!isSignatureVerified && !req.body.isSmartWallet) {
        return next(new ApiError(401, "Unauthorized."));
      }
    } catch (error) {
      console.error(error);
      return next(new ApiError(400, `Signature was not verified!`));
    }

    const authToken = this.authenticationService.generateToken(address);

    res.status(200).send(authToken);
  }

  async commitToBuy(req, res, next) {
    const supplyID = req.params.supplyID;
    const metadata = req.body;
    let userVoucher;

    try {
      userVoucher = await this.vouchersRepository.createVoucher(
        metadata,
        supplyID
      );
      await this.voucherSuppliesRepository.decrementVoucherSupplyQty(supplyID);
    } catch (error) {
      console.error(error);
      return next(
        new ApiError(
          400,
          `Buy operation for Supply id: ${supplyID} could not be completed.`
        )
      );
    }

    res.status(200).send({ userVoucherID: userVoucher.id });
  }
}

module.exports = UsersController;