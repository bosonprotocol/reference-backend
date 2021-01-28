//@ts-nocheck
const APIError = require("./../api-error");
const AuthService = require("../services/auth-service");
const mongooseService = require("../../database/index.js");
const roles = require("../../database/User/user-roles");

class AdminAuth {
  static async validateAdminAccess(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token == null) {
      return next(new APIError(401, "Unauthorized."));
    }

    try {
      const userObj = await AuthService.verifyToken(token);
      const ethAddress = userObj.user.toLowerCase();
      const user = await mongooseService.getUser(ethAddress);

      if (user.role != roles.ADMIN) {
        return next(new APIError(403, "User is not admin!"));
      }

      res.locals.address = ethAddress;
    } catch (error) {
      console.error(error);
      return next(new APIError(403, "Forbidden."));
    }

    next();
  }
}

module.exports = AdminAuth;
