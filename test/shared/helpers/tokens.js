const jwt = require("jsonwebtoken");

const Time = require("./Time");

class Tokens {
  static sign(payload, secret) {
    return jwt.sign(payload, secret);
  }

  static verify(token, secret) {
    return jwt.verify(token, secret);
  }

  static validityInSeconds(payload) {
    return payload.exp - payload.iat;
  }

  static validityInDays(payload) {
    return this.validityInSeconds(payload) / Time.oneDayInSeconds();
  }
}

module.exports = Tokens;
