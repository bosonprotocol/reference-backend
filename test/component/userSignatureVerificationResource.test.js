const { expect } = require("chai");

const Random = require("../shared/helpers/random");
const Database = require("../shared/helpers/database");
const Tokens = require("../shared/helpers/tokens");
const { Signing } = require("../shared/helpers/signing");

const TestServer = require("./helpers/TestServer");
const Client = require("./helpers/Client");

describe("User Signature Verification Resource", () => {
  let server;
  let database;
  let client;

  const tokenSecret = Random.tokenSecret();

  before(async () => {
    database = await Database.connect();
    server = await new TestServer()
      .onAnyPort()
      .withConfigurationOverrides({ tokenSecret })
      .start();
    client = new Client(server.address);
  });

  afterEach(async () => {
    await Database.truncate();
  });

  after(async () => {
    server.stop();
    database.disconnect();
  });

  context("on POST", () => {
    it("returns 200 with a JWT valid for 180 days when the signature is valid", async () => {
      const account = Random.account();
      const domain = Random.signingDomain();
      const address = account.address;

      const nonce = (await client.createOrUpdateUser(address)).body;
      const signature = await Signing.signAuthenticationMessage(
        account,
        nonce,
        domain
      );

      const response = await client.verifyUserSignature(
        address,
        domain,
        signature
      );

      const token = response.text;
      const tokenPayload = Tokens.verify(token, tokenSecret);
      const tokenValidityInDays = Tokens.validityInDays(tokenPayload);

      expect(response.statusCode).to.eql(200);
      expect(tokenPayload.user).to.eql(address);
      expect(tokenValidityInDays).to.eql(180);
    });

    it("returns 401 when the signature is incorrect", async () => {
      const account = Random.account();
      const domain = Random.signingDomain();
      const address = account.address;

      await client.createOrUpdateUser(address)

      const nonce = Random.nonce();
      const signature = await Signing.signAuthenticationMessage(
        account,
        nonce,
        domain
      );

      const response = await client.verifyUserSignature(
        address,
        domain,
        signature
      );

      expect(response.statusCode).to.eql(401);
      expect(response.body).to.eql("Unauthorized.");
    });
  });
});
