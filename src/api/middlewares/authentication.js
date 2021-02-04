//@ts-nocheck
const APIError = require("./../api-error");
const ConfigurationService = require("../../services/configuration-service");
const AuthenticationService = require("../../services/authentication-service");

const configurationService = new ConfigurationService();
const authenticationService = new AuthenticationService({
  configurationService,
});

class Authentication {
  static async authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token == null) {
      return next(new APIError(401, "Unauthorized."));
    }

    try {
      const userObj = authenticationService.verifyToken(token);
      res.locals.address = userObj.user.toLowerCase();
    } catch (error) {
      return next(new APIError(403, "Forbidden."));
    }

    next();
  }

  static async authenticateGCLOUDService(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token == null) {
      return next(new APIError(401, "Unauthorized."));
    }

    try {
      const payload = authenticationService.verifyToken(token);
      if (payload.token !== configurationService.gcloudSecret) {
        return next(new APIError(403, "Forbidden."));
      }
    } catch (error) {
      console.log(error);
      return next(new APIError(403, "Forbidden."));
    }

    next();
  }
}

module.exports = Authentication;
