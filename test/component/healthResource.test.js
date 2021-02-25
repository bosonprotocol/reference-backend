const { expect } = require("chai");

const API = require("./helpers/API");
const TestServer = require("./helpers/TestServer");
const Database = require("../shared/helpers/Database");

describe("Health Resource", () => {
  let server;
  let database;
  let api;

  before(async () => {
    database = await Database.connect();
    server = await new TestServer().onAnyPort().start();
    api = new API(server.address);
  });

  after(async () => {
    server.stop();
    database.disconnect();
  });

  context("on GET", () => {
    it("returns 200 and healthy body", async () => {
      const response = await api.health().get();

      expect(response.statusCode).to.eql(200);
      expect(response.body).to.eql({ healthy: true });
    });
  });
});
