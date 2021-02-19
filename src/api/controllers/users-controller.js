const nonceUtils = require("../../utils/nonceUtils");
const mongooseService = require("../../database/index.js");
const AuthValidator = require("../services/auth-service");
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
  }
}

module.exports = UserController;
