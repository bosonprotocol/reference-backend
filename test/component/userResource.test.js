const { expect } = require("chai");
const request = require("superagent");

const Random = require("../shared/helpers/random");
const Database = require("../shared/helpers/database");
const TestServer = require('./helpers/TestServer')
const Client = require("./helpers/Client");

describe("User Resource", () => {
  let server;
  let database;
  let client;

  before(async () => {
    database = await Database.connect();
    server = await new TestServer().onAnyPort().start();
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
    it("returns 200 with a random nonce on success", async () => {
      const address = Random.address();
      const response = await client.createOrUpdateUser(address);

      expect(response.statusCode).to.eql(200);
      expect(response.body).to.match(/\d{1,6}/);
    });
  });
});
