const { expect } = require("chai");

const userRoles = require("../../src/database/User/userRoles");

const Random = require("../shared/helpers/Random");
const Database = require("../shared/helpers/Database");
const Tokens = require("../shared/helpers/tokens");

const TestServer = require("./helpers/TestServer");
const Prerequisites = require("./helpers/Prerequisites");
const API = require("./helpers/API");

describe("Administration Resource", () => {
  let server;
  let database;
  let prerequisites;
  let api;

  const tokenSecret = Random.tokenSecret();
  const superadminUsername = "superadmin";
  const superadminPassword = "supersecret";

  before(async () => {
    database = await Database.connect();
    server = await new TestServer()
      .onAnyPort()
      .addConfigurationOverrides({
        tokenSecret,
        superadminUsername,
        superadminPassword,
      })
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

  context("on POST to super admin login", () => {
    it("returns 201 and a valid token when credentials are correct", async () => {
      const fiveMinutesInSeconds = 300;

      const response = await api
        .administration()
        .logInAsSuperadmin(superadminUsername, superadminPassword);

      const token = response.text;
      const payload = Tokens.verify(token, tokenSecret);
      const validityInSeconds = Tokens.validityInSeconds(payload);

      expect(response.status).to.eql(201);
      expect(validityInSeconds).to.eql(fiveMinutesInSeconds);
      expect(payload.user).to.eql(superadminUsername);
      expect(payload.role).to.eql(userRoles.ADMIN);
    });

    it("returns 401 when credentials are incorrect", async () => {
      const response = await api
        .administration()
        .logInAsSuperadmin("junk-username", "junk-password");

      expect(response.status).to.eql(401);
    });
  });

  context("on PATCH", () => {
    it("allows a superadmin to make another user into an admin", async () => {
      const superadminToken = await prerequisites.getSuperadminToken(
        superadminUsername,
        superadminPassword
      );

      const userAccount = Random.account();
      await prerequisites.getUserNonce(userAccount);
      const userAddress = userAccount.address;

      const userTokenBefore = await prerequisites.getUserToken(userAccount);
      const userTokenBeforePayload = Tokens.verify(
        userTokenBefore,
        tokenSecret
      );

      expect(userTokenBeforePayload.user).to.eql(userAddress.toLowerCase());
      expect(userTokenBeforePayload.role).to.eql(userRoles.USER);

      const response = await api
        .withToken(superadminToken)
        .administration()
        .makeAdmin(userAddress);

      expect(response.status).to.eql(200);

      const userTokenAfter = await prerequisites.getUserToken(userAccount);
      const userTokenAfterPayload = Tokens.verify(userTokenAfter, tokenSecret);

      expect(userTokenAfterPayload.user).to.eql(userAddress.toLowerCase());
      expect(userTokenAfterPayload.role).to.eql(userRoles.ADMIN);
    });

    it("allows an existing admin to make another user an admin", async () => {
      const adminToken = await prerequisites.getAdminToken(
        superadminUsername,
        superadminPassword
      );

      const userAccount = Random.account();
      await prerequisites.getUserNonce(userAccount);
      const userAddress = userAccount.address;

      const userTokenBefore = await prerequisites.getUserToken(userAccount);
      const userTokenBeforePayload = Tokens.verify(
        userTokenBefore,
        tokenSecret
      );

      expect(userTokenBeforePayload.user).to.eql(userAddress.toLowerCase());
      expect(userTokenBeforePayload.role).to.eql(userRoles.USER);

      const response = await api
        .withToken(adminToken)
        .administration()
        .makeAdmin(userAddress);

      expect(response.status).to.eql(200);

      const userTokenAfter = await prerequisites.getUserToken(userAccount);
      const userTokenAfterPayload = Tokens.verify(userTokenAfter, tokenSecret);

      expect(userTokenAfterPayload.user).to.eql(userAddress.toLowerCase());
      expect(userTokenAfterPayload.role).to.eql(userRoles.ADMIN);
    });

    it("disallows a user from making another user an admin", async () => {
      const firstUserAccount = Random.account();

      const firstUserToken = await prerequisites.getUserToken(firstUserAccount);

      const secondUserAccount = Random.account();
      await prerequisites.getUserNonce(secondUserAccount);
      const secondUserAddress = secondUserAccount.address;

      const secondUserTokenBefore = await prerequisites.getUserToken(
        secondUserAccount
      );
      const secondUserTokenBeforePayload = Tokens.verify(
        secondUserTokenBefore,
        tokenSecret
      );

      expect(secondUserTokenBeforePayload.user).to.eql(
        secondUserAddress.toLowerCase()
      );
      expect(secondUserTokenBeforePayload.role).to.eql(userRoles.USER);

      const response = await api
        .withToken(firstUserToken)
        .administration()
        .makeAdmin(secondUserAddress);

      expect(response.status).to.eql(403);

      const secondUserTokenAfter = await prerequisites.getUserToken(secondUserAccount);
      const secondUserTokenAfterPayload = Tokens.verify(secondUserTokenAfter, tokenSecret);

      expect(secondUserTokenAfterPayload.user).to.eql(secondUserAddress.toLowerCase());
      expect(secondUserTokenAfterPayload.role).to.eql(userRoles.USER);
    });
  });
});
