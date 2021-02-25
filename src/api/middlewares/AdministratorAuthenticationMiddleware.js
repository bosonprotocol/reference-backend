// @ts-nocheck
const ApiError = require("./../ApiError");
const userRoles = require("../../database/User/userRoles");

class AdministratorAuthenticationMiddleware {
  constructor(authenticationService, usersRepository) {
    this.authenticationService = authenticationService;
    this.usersRepository = usersRepository;
  }

  async validateAdminAccess(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token == null) {
      return next(new ApiError(401, "Unauthorized."));
    }

    try {
      const payload = this.authenticationService.verifyToken(token);

      if (payload.role !== userRoles.ADMIN) {
        return next(new ApiError(403, "User is not admin!"));
      }

      res.locals.address = payload.user;
    } catch (error) {
      console.error(error);
      return next(new ApiError(403, "Forbidden."));
    }

    next();
  }
}

module.exports = AdministratorAuthenticationMiddleware;
