const nonceUtils = require("../../utils/nonceUtils");
const mongooseService = require("../../database/index.js");
const AuthValidator = require("../../services/auth-service");
const APIError = require("../api-error");

class UserController {
  static async generateNonce(req, res, next) {
    const address = req.params.address;
    let randomNonce;

    try {
      randomNonce = nonceUtils.generateRandomNumber();
      await mongooseService.preserveNonce(address.toLowerCase(), randomNonce);
    } catch (error) {
      console.error(error);
      return next(
        new APIError(400, `Could not preserve nonce for user: ${address}.`)
      );
    }

    res.status(200).json(randomNonce);
  }

  static async verifySignature(req, res, next) {
    const address = req.params.address;

    try {
      const nonce = await mongooseService.getNonce(address.toLowerCase());

      const message = {
        value: `Authentication message: ${nonce}`,
      };

      const isSignatureVerified = await AuthValidator.isSignatureVerified(
        address,
        req.body.domain,
        req.body.types,
        message,
        req.body.signature
      );

      if (!isSignatureVerified && !req.body.isSmartWallet) {
        return next(new APIError(401, "Unauthorized."));
      }
    } catch (error) {
      console.error(error);
      return next(new APIError(400, `Signature was not verified!`));
    }

    const authToken = AuthValidator.generateAccessToken(address);
    res.status(200).send(authToken);
  }

  static async commitToBuy(req, res, next) {
    const supplyID = req.params.supplyID;
    const metadata = req.body;
    let userVoucher;

    try {
      userVoucher = await mongooseService.createVoucher(metadata, supplyID);
      await mongooseService.updateVoucherQty(supplyID);
    } catch (error) {
      console.error(error);
      return next(
        new APIError(
          400,
          `Buy operation for Supply id: ${supplyID} could not be completed.`
        )
      );
    }

    res.status(200).send({ userVoucherID: userVoucher.id });
  }
}

module.exports = UserController;
