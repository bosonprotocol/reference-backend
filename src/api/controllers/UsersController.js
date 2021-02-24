const ApiError = require("../ApiError");

const nonceUtils = require("../../utils/nonceUtils");

class UsersController {
  constructor(authenticationService, usersRepository) {
    this.authenticationService = authenticationService;
    this.usersRepository = usersRepository;
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

    let user;

    try {
      user = await this.usersRepository.getUser(address.toLowerCase());

      const message = {
        value: `Authentication message: ${user.nonce}`,
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

    const authToken = this.authenticationService.generateToken(user);

    res.status(200).send(authToken);
  }
}

module.exports = UsersController;
