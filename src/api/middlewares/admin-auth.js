//@ts-nocheck
const APIError = require("./../api-error");
const ConfigurationService = require("../../services/configuration-service");
const AuthenticationService = require("../../services/authentication-service");
const UsersRepository = require("../../database/User/users-repository");
const userRoles = require("../../database/User/user-roles");

const configurationService = new ConfigurationService();
const authenticationService = new AuthenticationService({
  configurationService,
});
const usersRepository = new UsersRepository();

class AdminAuth {
  static async validateAdminAccess(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token == null) {
      return next(new APIError(401, "Unauthorized."));
    }

    try {
      const userObj = authenticationService.verifyToken(token);
      const ethAddress = userObj.user.toLowerCase();
      const user = await usersRepository.getUser(ethAddress);

      if (user.role !== userRoles.ADMIN) {
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
