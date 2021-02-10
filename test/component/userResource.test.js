const { expect } = require("chai");
const request = require("superagent");
const mongoose = require("mongoose");

const Server = require("../../src/server");
const UsersRoutes = require("../../src/api/routes/users-routes");
const ConfigurationService = require('../../src/services/configuration-service')
const User = require("../../src/database/models/User");
const Payment = require("../../src/database/models/Payment");
const Voucher = require("../../src/database/models/Voucher");
const VoucherSupply = require("../../src/database/models/VoucherSupply");

const Ports = require("../helpers/ports");
const Random = require('../helpers/random')

describe("User Resource", () => {
  let server;

  before(async () => {
    const configurationService = new ConfigurationService();
    const databaseConnectionString =
      configurationService.databaseConnectionString ||
      "mongodb://admin:secret@localhost:27017/admin";
    await mongoose.connect(databaseConnectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });

    const port = await Ports.getAvailablePort();

    server = new Server().withRoutes("/users", new UsersRoutes()).start(port);
  });

  afterEach(async () => {
    await User.collection.deleteMany({});
    await Payment.collection.deleteMany({});
    await Voucher.collection.deleteMany({});
    await VoucherSupply.collection.deleteMany({});
  });

  after(async () => {
    server.stop();
  });

  context("on POST", () => {
    it("returns 200 with a random nonce on success", async () => {
      const address = Random.address();
      const response = await request.post(`${server.address}/users/${address}`);

      expect(response.statusCode).to.eql(200);
      expect(response.body).to.match(/\d{1,6}/);
    });
  });
});
