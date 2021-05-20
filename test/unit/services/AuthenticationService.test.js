const { expect } = require("chai");

const AuthenticationService = require("../../../src/services/AuthenticationService");
const userRoles = require("../../../src/database/User/userRoles");

const Tokens = require("../../shared/helpers/Tokens");
const Random = require("../../shared/helpers/Random");

describe("AuthenticationService", () => {
  context("generateToken", () => {
    it(
      "generates a token for the user using the configured " +
        "token secret, and 7 days validity by default",
      () => {
        const tokenSecret = Random.tokenSecret();

        const address = Random.address();
        const role = userRoles.USER;
        const user = Random.user({ address, role });
        const authenticationService = new AuthenticationService(tokenSecret);

        const token = authenticationService.generateToken(user);

        const result = Tokens.verify(token, tokenSecret);
        const resultValidityInDays = Tokens.validityInDays(result);

        expect(result.user).to.eql(address.toLowerCase());
        expect(result.role).to.eql(role);
        expect(resultValidityInDays).to.eql(7);
      }
    );

    it(
      "generates a token for the user using the configured " +
        "token secret, and provided validity when specified",
      () => {
        const tokenSecret = Random.tokenSecret();

        const address = Random.address();
        const role = userRoles.USER;
        const user = Random.user({ address, role });

        const validityInSeconds = 300;

        const authenticationService = new AuthenticationService(tokenSecret);

        const token = authenticationService.generateToken(
          user,
          validityInSeconds
        );

        const result = Tokens.verify(token, tokenSecret);
        const resultValidityInSeconds = Tokens.validityInSeconds(result);

        expect(result.user).to.eql(address.toLowerCase());
        expect(result.role).to.eql(role);
        expect(resultValidityInSeconds).to.eql(300);
      }
    );
  });

  context("verifyToken", () => {
    it("verifies a token signed using the configured token secret returning the payload", () => {
      const address = Random.address();
      const role = Random.userRole();
      const tokenSecret = Random.tokenSecret();

      const authenticationService = new AuthenticationService(tokenSecret);

      const token = Tokens.sign(
        {
          user: address.toLowerCase(),
          role,
        },
        tokenSecret
      );

      const result = authenticationService.verifyToken(token);

      expect(result.user).to.eql(address.toLowerCase());
      expect(result.role).to.eql(role);
    });

    it("throws when verifying a token signed using a different token secret", () => {
      const address = Random.address();
      const role = Random.userRole();
      const signingTokenSecret = Random.tokenSecret();
      const verifyingTokenSecret = Random.tokenSecret();

      const authenticationService = new AuthenticationService(
        verifyingTokenSecret
      );

      const token = Tokens.sign(
        {
          user: address.toLowerCase(),
          role,
        },
        signingTokenSecret
      );

      expect(() => {
        authenticationService.verifyToken(token);
      }).to.throw("invalid signature");
    });
  });
});
