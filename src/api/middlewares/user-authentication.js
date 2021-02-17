// @ts-nocheck
const APIError = require("./../api-error");

class UserAuthenticationMiddleware {
  constructor(configurationService, authenticationService) {
    this.configurationService = configurationService;
    this.authenticationService = authenticationService;
  }

  async authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token == null) {
      return next(new APIError(401, "Unauthorized."));
    }

    try {
      const userObj = this.authenticationService.verifyToken(token);
      res.locals.address = userObj.user.toLowerCase();
    } catch (error) {
      return next(new APIError(403, "Forbidden."));
    }

    next();
  }

  async authenticateGCLOUDService(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token == null) {
      return next(new APIError(401, "Unauthorized."));
    }

    try {
      const payload = this.authenticationService.verifyToken(token);
      if (payload.token !== this.configurationService.gcloudSecret) {
        return next(new APIError(403, "Forbidden."));
      }
    } catch (error) {
      console.log(error);
      return next(new APIError(403, "Forbidden."));
    }

    next();
  }
}

module.exports = UserAuthenticationMiddleware;
