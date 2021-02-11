const { expect } = require("chai");

const ConfigurationService = require("../../../src/services/configuration-service");
const AuthenticationService = require("../../../src/services/authentication-service");

const Tokens = require("../../shared/helpers/tokens");

describe("AuthenticationService", () => {
  context("generateToken", () => {
    it("generates a token for the address using the configured token secret", () => {
      const address = "0x9b8B1ac5979991E72D61c8C4cB6a95Ecd2d6E706";
      const tokenSecret = "abcd1234";
      const configurationService = new ConfigurationService({
        tokenSecret,
      });
      const authenticationService = new AuthenticationService({
        configurationService,
      });

      const token = authenticationService.generateToken(address);

      const result = Tokens.verify(token, tokenSecret);

      expect(result.user).to.eql(address);
    });
  });

  context("verifyToken", () => {
    it("verifies a token signed using the configured token secret returning the payload", () => {
      const address = "0x9b8B1ac5979991E72D61c8C4cB6a95Ecd2d6E706";
      const tokenSecret = "abcd1234";
      const configurationService = new ConfigurationService({
        tokenSecret,
      });
      const authenticationService = new AuthenticationService({
        configurationService,
      });

      const token = Tokens.sign({ user: address }, tokenSecret);

      const result = authenticationService.verifyToken(token);

      expect(result.user).to.eql(address);
    });

    it("throws when verifying a token signed using a different token secret", () => {
      const address = "0x9b8B1ac5979991E72D61c8C4cB6a95Ecd2d6E706";
      const signingTokenSecret = "abcd1234";
      const verifyingTokenSecret = "efgh5678";
      const configurationService = new ConfigurationService({
        tokenSecret: verifyingTokenSecret,
      });
      const authenticationService = new AuthenticationService({
        configurationService,
      });

      const token = Tokens.sign({ user: address }, signingTokenSecret);

      expect(() => {
        authenticationService.verifyToken(token);
      }).to.throw("invalid signature");
    });
  });
});
