const APIError = require("../api-error");
const jwt = require("jsonwebtoken");
const utils = require("ethers").utils;

class AuthService {
  static async authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token == null) {
      return next(new APIError(401, "Unauthorized."));
    }

    try {
      res.locals.address = await jwt.verify(token, process.env.TOKEN_SECRET);
    } catch (error) {
      return next(new APIError(403, "Forbidden."));
    }

    next();
  }

  static async isSignatureVerified(address, domain, types, message, signature) {
    const verifiedWalletAddress = utils.verifyTypedData(
      domain,
      types,
      message,
      signature
    );

    return address === verifiedWalletAddress;
  }

  static generateAccessToken(address) {
    const payload = {
      user: address,
    };

    return jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: "180d" });
  }

  static async verifyToken(token) {
    return await jwt.verify(token, process.env.TOKEN_SECRET);
  }
}

module.exports = AuthService;
