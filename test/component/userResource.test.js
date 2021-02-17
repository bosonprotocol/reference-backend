const { expect } = require("chai");

const Random = require("../shared/helpers/Random");
const Database = require("../shared/helpers/Database");
const TestServer = require('./helpers/TestServer')
const API = require("./helpers/API");

describe("User Resource", () => {
  let server;
  let database;
  let api;

  before(async () => {
    database = await Database.connect();
    server = await new TestServer().onAnyPort().start();
    api = new API(server.address);
  });

  afterEach(async () => {
    await Database.truncate();
  });

  after(async () => {
    server.stop();
    database.disconnect();
  });

  context("on POST", () => {
    it("returns 200 with a random nonce on success", async () => {
      const address = Random.address();

      const response = await (api.users().post(address));

      expect(response.statusCode).to.eql(200);
      expect(response.body).to.match(/\d{1,6}/);
    });
  });
});
