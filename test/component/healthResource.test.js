const { expect } = require("chai");
const request = require("superagent");

const Server = require("../../src/server");
const HealthRoutes = require("../../src/api/routes/health-routes");

const Ports = require("../helpers/ports");

describe("Health Resource", () => {
  let server;

  before(async () => {
    const port = await Ports.getAvailablePort();

    server = new Server().withRoutes("/health", new HealthRoutes()).start(port);
  });

  after(async () => {
    server.stop();
  });

  context("on GET", () => {
    it("returns 200 and healthy body", async () => {
      const response = await request.get(`${server.address}/health`);

      expect(response.statusCode).to.eql(200);
      expect(response.body).to.eql({ healthy: true });
    });
  });
});
