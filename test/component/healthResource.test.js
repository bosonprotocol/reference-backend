const { expect } = require("chai");

const TestServer = require("./helpers/TestServer");
const Client = require("./helpers/Client");

describe("Health Resource", () => {
  let server;
  let client;

  before(async () => {
    server = await new TestServer().onAnyPort().start();
    client = new Client(server.address);
  });

  after(async () => {
    server.stop();
  });

  context("on GET", () => {
    it("returns 200 and healthy body", async () => {
      const response = await client.getHealth();

      expect(response.statusCode).to.eql(200);
      expect(response.body).to.eql({ healthy: true });
    });
  });
});
