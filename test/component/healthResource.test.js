const { expect } = require("chai");
const request = require("superagent");

const Server = require("../../src/server");
const healthRouter = require("../../src/api/routes/health-route");

const Ports = require("../helpers/ports");

describe("Health Resource", () => {
  let server;

  before(async () => {
    const port = await Ports.getAvailablePort();

    server = new Server().withRouter("/health", healthRouter).start(port);
  });

  after(async () => {
    server.stop();
  });

  it("returns 200 and healthy body when healthy", async () => {
    const response = await request.get(`${server.address}/health`);

    expect(response.statusCode).to.eql(200);
    expect(response.body).to.eql({ healthy: true });
  });
});
