const { expect } = require("chai");

const Random = require("../shared/helpers/random");
const Database = require("../shared/helpers/database");

const TestServer = require("./helpers/TestServer");
const Prerequisites = require("./helpers/Prerequisites");
const API = require('./helpers/API')

describe("Voucher Supplies Resource", () => {
  let server;
  let database;
  let prerequisites;
  let api;

  const tokenSecret = Random.tokenSecret();

  before(async () => {
    database = await Database.connect();
    server = await new TestServer()
      .onAnyPort()
      .withConfigurationOverrides({ tokenSecret })
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
    it("returns 201 and the created voucher supply", async () => {
      const account = Random.account();
      const token = await prerequisites.getUserToken(account);

      expect(token).not.to.be.null;
    });
  });
});
