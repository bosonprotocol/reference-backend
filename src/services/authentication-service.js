const jwt = require("jsonwebtoken");
const { utils } = require("ethers");

class AuthenticationService {
  constructor({ configurationService }) {
    this.configurationService = configurationService;
  }

  isSignatureVerified(address, domain, types, message, signature) {
    const verifiedWalletAddress = utils.verifyTypedData(
      domain,
      types,
      message,
      signature
    );

    return address === verifiedWalletAddress;
  }

  generateToken(address) {
    const tokenSecret = this.configurationService.tokenSecret;
    const payload = { user: address };
    const options = { expiresIn: "180d" };

    return jwt.sign(payload, tokenSecret, options);
  }

  verifyToken(token) {
    const tokenSecret = this.configurationService.tokenSecret;

    return jwt.verify(token, tokenSecret);
  }
}

module.exports = AuthenticationService;
