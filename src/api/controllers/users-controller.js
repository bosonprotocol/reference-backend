const APIError = require("../api-error");
const nonceUtils = require("../../utils/nonceUtils");
const UsersRepository = require("../../database/User/users-repository");
const ConfigurationService = require("../../services/configuration-service");
const AuthenticationService = require("../../services/authentication-service");

const configurationService = new ConfigurationService();
const authenticationService = new AuthenticationService({
  configurationService,
});
const usersRepository = new UsersRepository();

class UserController {
  static async generateNonce(req, res, next) {
    const address = req.params.address;
    let randomNonce;

    try {
      randomNonce = nonceUtils.generateRandomNumber();
      await usersRepository.preserveNonce(address.toLowerCase(), randomNonce);
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
      const nonce = await usersRepository.getNonce(address.toLowerCase());

      const message = {
        value: `Authentication message: ${nonce}`,
      };

      const isSignatureVerified = await authenticationService.isSignatureVerified(
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

    const authToken = authenticationService.generateToken(address);

    res.status(200).send(authToken);
  }
}

module.exports = UserController;
