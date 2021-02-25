const { expect } = require("chai");

const API = require("./helpers/API");
const TestServer = require("./helpers/TestServer");

describe("Health Resource", () => {
  let server;
  let api;

  before(async () => {
    server = await new TestServer().onAnyPort().start();
    api = new API(server.address);
  });

  after(async () => {
    server.stop();
  });

  context("on GET", () => {
    it("getHealth - returns 200 and healthy body", async () => {
      const response = await api.health().get();

      expect(response.statusCode).to.eql(200);
      expect(response.body).to.eql({ healthy: true });
    });
  });
});
