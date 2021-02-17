const { expect } = require("chai");

const Random = require("../shared/helpers/Random");
const Database = require("../shared/helpers/Database");

const TestServer = require("./helpers/TestServer");
const Prerequisites = require("./helpers/Prerequisites");
const API = require("./helpers/API");

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
      .addConfigurationOverrides({ tokenSecret })
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
      const voucherSupplyOwner = account.address;
      const voucherSupplyMetadata = Random.voucherSupplyMetadata();
      const voucherSupplyData = {
        ...voucherSupplyMetadata,
        voucherOwner: voucherSupplyOwner
      };
      const imageFilePath = 'test/fixtures/valid-image.png';

      const response = await api
        .withToken(token)
        .voucherSupplies()
        .post(voucherSupplyData, imageFilePath);

      expect(response.status).to.eql(201);
    });
  });
});
