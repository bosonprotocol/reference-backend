const { expect } = require("chai");

const Random = require("../shared/helpers/Random");
const Database = require("../shared/helpers/Database");
const Tokens = require("../shared/helpers/Tokens");
const { Signing } = require("../shared/helpers/Signing");

const API = require("./helpers/API");
const TestServer = require("./helpers/TestServer");
const Prerequisites = require("./helpers/Prerequisites");

describe("User Signature Verification Resource", () => {
  let server;
  let database;
  let api;
  let prerequisites;

  const tokenSecret = Random.tokenSecret();

  before(async () => {
    database = await Database.connect();
    server = await new TestServer()
      .onAnyPort()
      .addConfigurationOverrides({ tokenSecret })
      .start();
    api = new API(server.address);
    prerequisites = new Prerequisites(api);
  });

  afterEach(async () => {
    await Database.truncate();
  });

  after(async () => {
    server.stop();
    database.disconnect();
  });

  context("on POST", () => {
    it("verifySignature - returns 200 with a JWT valid for 7 days when the signature is valid", async () => {
      const account = Random.account();
      const domain = Random.signingDomain();
      const address = account.address;

      const nonce = await prerequisites.getUserNonce(account);
      const signature = await Signing.signAuthenticationMessage(
        account,
        nonce,
        domain
      );

      const response = await api
        .user(address)
        .signatureVerification()
        .post(domain, signature);

      const token = response.text;
      const tokenPayload = Tokens.verify(token, tokenSecret);
      const tokenValidityInDays = Tokens.validityInDays(tokenPayload);

      expect(response.statusCode).to.eql(200);
      expect(tokenPayload.user).to.eql(address.toLowerCase());
      expect(tokenValidityInDays).to.eql(7);
    });

    it("verifySignature - returns 401 when the signature is incorrect", async () => {
      const account = Random.account();
      const domain = Random.signingDomain();
      const address = account.address;

      await api.users().post(address);

      const nonce = Random.nonce();
      const signature = await Signing.signAuthenticationMessage(
        account,
        nonce,
        domain
      );

      const response = await api
        .user(address)
        .signatureVerification()
        .post(domain, signature);

      expect(response.statusCode).to.eql(401);
      expect(response.body).to.eql("Unauthorized.");
    });

    it("verifySignature - returns 400 when the signature is invalid", async () => {
      const account = Random.account();
      const domain = Random.signingDomain();
      const address = account.address;

      await api.users().post(address);

      const signature = "not-a-signature";

      const response = await api
        .user(address)
        .signatureVerification()
        .post(domain, signature);

      expect(response.statusCode).to.eql(400);
      expect(response.body).to.eql("Signature was not verified!");
    });
  });
});
