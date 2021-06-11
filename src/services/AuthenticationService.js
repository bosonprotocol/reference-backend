const jwt = require("jsonwebtoken");
const { utils } = require("ethers");

class AuthenticationService {
  constructor(tokenSecret) {
    this.tokenSecret = tokenSecret;
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

  generateToken(user, expiresIn = "7d") {
    const tokenSecret = this.tokenSecret;
    const payload = { user: user.address.toLowerCase(), role: user.role };
    const options = { expiresIn };

    return jwt.sign(payload, tokenSecret, options);
  }

  verifyToken(token) {
    const tokenSecret = this.tokenSecret;

    return jwt.verify(token, tokenSecret);
  }
}

module.exports = AuthenticationService;
