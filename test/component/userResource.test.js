const { expect } = require("chai");

const Random = require("../shared/helpers/Random");
const Database = require("../shared/helpers/Database");
const TestServer = require('./helpers/TestServer');
const Prerequisites = require("./helpers/Prerequisites");
const API = require("./helpers/API");

describe("User Resource", () => {
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
    it("returns 200 with a random nonce on success", async () => {
      const address = Random.address();

      const response = await (api.users().post(address));

      expect(response.statusCode).to.eql(200);
      expect(response.body).to.match(/\d{1,6}/);
    });

    it("returns 200 with the voucher ID", async () => {
      // CREATE VOUCHER SUPPLY
      const [token, voucherSupplyData, imageFilePath] = await prerequisites.createVoucherSupplyData();
      const [voucherSupplyId, voucherSupplyOwner] = await prerequisites.createVoucherSupply(token, voucherSupplyData, imageFilePath);
      // END CREATE VOUCHER SUPPLY

      // COMMIT TO BUY
      const voucherMetadata = prerequisites.createVoucherMetadata(voucherSupplyOwner);
      const [createVoucherResponseCode, createVoucherResponseBody] = await prerequisites.createVoucher(token, voucherSupplyId, voucherMetadata);
      // END COMMIT TO BUY

      const expectedPropertyName = "userVoucherID";
      const propertyNames = Object.getOwnPropertyNames(createVoucherResponseBody);

      expect(createVoucherResponseCode).to.eql(200);
      expect(propertyNames).to.include(expectedPropertyName);
    });

    it("returns 403 with forbidden (voucher holder doesn't match requesting address)", async () => {
      // CREATE VOUCHER SUPPLY
      const [token, voucherSupplyData, imageFilePath] = await prerequisites.createVoucherSupplyData();
      const [voucherSupplyId, voucherSupplyOwner] = await prerequisites.createVoucherSupply(token, voucherSupplyData, imageFilePath);
      // END CREATE VOUCHER SUPPLY

      // COMMIT TO BUY
      const voucherMetadata = prerequisites.createVoucherMetadata(); // no override to force failure
      const [createVoucherResponseCode, createVoucherResponseBody] = await prerequisites.createVoucher(token, voucherSupplyId, voucherMetadata);
      // END COMMIT TO BUY

      expect(createVoucherResponseCode).to.eql(403);
    });
  });
});
