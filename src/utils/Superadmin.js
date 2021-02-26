const userRoles = require("../database/User/userRoles");
const { zeroAddress } = require("./addresses");

class Superadmin {
  static instance() {
    return new Superadmin();
  }

  get address() {
    return zeroAddress;
  }

  get role() {
    return userRoles.ADMIN;
  }
}

module.exports = Superadmin;
