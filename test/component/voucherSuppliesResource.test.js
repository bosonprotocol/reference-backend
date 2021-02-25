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
  const gcloudSecret = Random.gcloudSecret();

  before(async () => {
    database = await Database.connect();
    server = await new TestServer()
      .onAnyPort()
      .addConfigurationOverrides({ tokenSecret, gcloudSecret })
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
    it("createVoucherSupply - returns 201 and the created voucher supply", async () => {
      const [token, voucherSupplyData, imageFilePath] = await prerequisites.createVoucherSupplyData();

      const response = await api
        .withToken(token)
        .voucherSupplies()
        .post(voucherSupplyData, imageFilePath);

      expect(response.status).to.eql(201);
    });

    it("createVoucherSupply - returns 400 when invalid dates (start and/or end)", async () => {
      let [token, voucherSupplyData, imageFilePath] = await prerequisites.createVoucherSupplyData();

      voucherSupplyData.startDate = "FAKE_INVALID_START_DATE" // force failure
      voucherSupplyData.endDate = "FAKE_INVALID_END_DATE" // force failure

      const response = await api
          .withToken(token)
          .voucherSupplies()
          .post(voucherSupplyData, imageFilePath);

      expect(response.status).to.eql(400);
    });

    it("createVoucherSupply - returns 400 when invalid voucher supply data", async () => {
      const [token, voucherSupplyData, imageFilePath] = await prerequisites.createVoucherSupplyData();

      const fakeVoucherSupplyData = {}; // force failure

      const response = await api
          .withToken(token)
          .voucherSupplies()
          .post(fakeVoucherSupplyData, imageFilePath);

      expect(response.status).to.eql(400);
    });
  });

  context("on GET", () => {
    it("getAllVoucherSupplies - returns 200 and all voucher supplies", async () => {
      const response = await api.voucherSupplies().getAll();
      const expectedPropertyName = "voucherSupplies";

      const propertyNames = Object.getOwnPropertyNames(response.body);
      const voucherSuppliesProperty = response.body[expectedPropertyName];

      expect(response.status).to.eql(200);
      expect(propertyNames).to.include(expectedPropertyName);
      expect(Array.isArray(voucherSuppliesProperty)).to.eql(true);
    });

    it("getVoucherSupplyById - returns 200 and the requested voucher supply (by ID)", async () => {
      // CREATE VOUCHER SUPPLY
      const [token, voucherSupplyData, imageFilePath] = await prerequisites.createVoucherSupplyData();
      const [voucherSupplyId, voucherSupplyOwner] = await prerequisites.createVoucherSupply(token, voucherSupplyData, imageFilePath);
      // END CREATE VOUCHER SUPPLY

      // QUERY FOR VOUCHER
      const response = await api
          .voucherSupplies()
          .getById(voucherSupplyId);

      expect(response.status).to.eql(200);
      expect(response.body.voucherSupply._id).to.eql(voucherSupplyId); // check if queried id matches created id
    });

    it("getVoucherSupplyById - returns 400 and voucher doesn't exist", async () => {
      const randomVoucherSupplyId = Random.voucherSupplyId(); // create random instead of extracting

      // QUERY FOR VOUCHER
      const response = await api
          .voucherSupplies()
          .getById(randomVoucherSupplyId);

      expect(response.status).to.eql(400);
    });

    it("getVoucherSupplyStatusesByOwner - returns 200 and the statuses of all voucher supplies for the given address", async () => {
      const expectedPropertyNames = ["active", "inactive"];
      const account = Random.account();
      const token = await prerequisites.getUserToken(account);

      const response = await api
          .withToken(token)
          .voucherSupplies()
          .getStatuses();

      const propertyNames = Object.getOwnPropertyNames(response.body);

      expect(response.status).to.eql(200);
      expect(propertyNames).to.include.members(expectedPropertyNames);
    });

    it("getActiveVoucherSuppliesByOwner - returns 200 and the active voucher supplies for the given address", async () => {
      const expectedPropertyName = "voucherSupplies";
      const account = Random.account();
      const token = await prerequisites.getUserToken(account);

      const response = await api
          .withToken(token)
          .voucherSupplies()
          .getActive();

      const propertyNames = Object.getOwnPropertyNames(response.body);

      expect(response.status).to.eql(200);
      expect(propertyNames).to.include(expectedPropertyName);
    });

    it("getInactiveVoucherSuppliesByOwner - returns 200 and the inactive voucher supplies for the given address", async () => {
      const expectedPropertyName = "voucherSupplies";
      const account = Random.account();
      const token = await prerequisites.getUserToken(account);

      const response = await api
          .withToken(token)
          .voucherSupplies()
          .getInactive();

      const propertyNames = Object.getOwnPropertyNames(response.body);

      expect(response.status).to.eql(200);
      expect(propertyNames).to.include(expectedPropertyName);
    });

    it("getVoucherSuppliesForSeller - returns 200 and the voucher supplies for the given seller", async () => {
      const expectedPropertyName = "voucherSupplies";
      const account = Random.account();
      const voucherSupplyOwner = account.address;

      const response = await api
          .voucherSupplies()
          .getBySeller(voucherSupplyOwner);

      const propertyNames = Object.getOwnPropertyNames(response.body);

      expect(response.status).to.eql(200);
      expect(propertyNames).to.include(expectedPropertyName);
    });

    it("getVoucherSuppliesForBuyer - returns 200 and the voucher supplies for the given buyer", async () => {
      const expectedPropertyName = "voucherSupplies";
      const account = Random.account();
      const voucherSupplyOwner = account.address;

      const response = await api
          .voucherSupplies()
          .getByBuyer(voucherSupplyOwner);

      const propertyNames = Object.getOwnPropertyNames(response.body);

      expect(response.status).to.eql(200);
      expect(propertyNames).to.include(expectedPropertyName);
    });
  });

  context("on Patch", () => {
    it("updateVoucherSupply - returns 200 and the voucher supply update status", async () => {
      const expectedPropertyName = "success";

      // CREATE VOUCHER SUPPLY
      const [token, voucherSupplyData, imageFilePath] = await prerequisites.createVoucherSupplyData();
      const [voucherSupplyId, voucherSupplyOwner] = await prerequisites.createVoucherSupply(token, voucherSupplyData, imageFilePath);
      // END CREATE VOUCHER SUPPLY

      // UPDATE VOUCHER WITH NEW IMAGE
      const newImageFilePath = 'test/fixtures/update-image.png';

      const response = await api
          .withToken(token)
          .voucherSupplies()
          .update(voucherSupplyId, newImageFilePath);

      const propertyNames = Object.getOwnPropertyNames(response.body);
      // END OF UPDATE

      expect(response.status).to.eql(200);
      expect(propertyNames).to.include(expectedPropertyName);
      expect(response.body[expectedPropertyName]).to.eql(true); // expect success = true
    });

    it("updateVoucherSupply - returns 400 with voucher supply does not exist (i.e. invalid ID)", async () => {
      const account = Random.account();
      const token = await prerequisites.getUserToken(account);
      const randomVoucherSupplyId = Random.voucherSupplyId(); // create random instead of extracting
      const newImageFilePath = 'test/fixtures/update-image.png';

      const response = await api
          .withToken(token)
          .voucherSupplies()
          .update(randomVoucherSupplyId, newImageFilePath);

      expect(response.status).to.eql(400);
    });

    it("setVoucherSupplyMetaData - returns 200 and the success status", async () => {
      const gcloudToken = await prerequisites.getGCloudToken(gcloudSecret, tokenSecret);

      // CREATE VOUCHER SUPPLY
      const [token, voucherSupplyData, imageFilePath] = await prerequisites.createVoucherSupplyData();
      const [voucherSupplyId, voucherSupplyOwner] = await prerequisites.createVoucherSupply(token, voucherSupplyData, imageFilePath);
      voucherSupplyData.id = voucherSupplyId;
      // END CREATE VOUCHER SUPPLY

      // SET VOUCHER SUPPLY METADATA
      const response = await api
          .withToken(gcloudToken)
          .voucherSupplies()
          .setMetadata(voucherSupplyData);

      const expectedPropertyName = "success";
      const propertyNames = Object.getOwnPropertyNames(response.body);
      // SET VOUCHER SUPPLY METADATA

      expect(response.status).to.eql(200);
      expect(propertyNames).to.include(expectedPropertyName);
      expect(response.body[expectedPropertyName]).to.eql(true);
    });

    it("setVoucherSupplyMetaData - returns 400 and voucher supply doesn't exist", async () => {
      const gcloudToken = await prerequisites.getGCloudToken(gcloudSecret, tokenSecret);

      // CREATE VOUCHER SUPPLY
      const [token, voucherSupplyData, imageFilePath] = await prerequisites.createVoucherSupplyData();
      const [voucherSupplyId, voucherSupplyOwner] = await prerequisites.createVoucherSupply(token, voucherSupplyData, imageFilePath);
      voucherSupplyData.id = Random.voucherSupplyId(); // force failure
      // END CREATE VOUCHER SUPPLY

      // SET VOUCHER SUPPLY METADATA
      const response = await api
          .withToken(gcloudToken)
          .voucherSupplies()
          .setMetadata(voucherSupplyData);
      // SET VOUCHER SUPPLY METADATA

      expect(response.status).to.eql(400);
    });

    it("setVoucherSupplyMetaData - returns 400 when supply token id is missing", async () => {
      const gcloudToken = await prerequisites.getGCloudToken(gcloudSecret, tokenSecret);

      // CREATE VOUCHER SUPPLY
      const [token, voucherSupplyData, imageFilePath] = await prerequisites.createVoucherSupplyData();
      const [voucherSupplyId, voucherSupplyOwner] = await prerequisites.createVoucherSupply(token, voucherSupplyData, imageFilePath);
      voucherSupplyData.id = voucherSupplyId;
      // END CREATE VOUCHER SUPPLY

      delete voucherSupplyData._tokenIdSupply; // force failure

      // SET VOUCHER SUPPLY METADATA
      const response = await api
          .withToken(gcloudToken)
          .voucherSupplies()
          .setMetadata(voucherSupplyData);
      // SET VOUCHER SUPPLY METADATA

      expect(response.status).to.eql(400);
    });

    it("setVoucherSupplyMetaData - returns 400 when voucher supply data is null", async () => {
      const gcloudToken = await prerequisites.getGCloudToken(gcloudSecret, tokenSecret);

      // CREATE VOUCHER SUPPLY
      const [token, voucherSupplyData, imageFilePath] = await prerequisites.createVoucherSupplyData();
      const [voucherSupplyId, voucherSupplyOwner] = await prerequisites.createVoucherSupply(token, voucherSupplyData, imageFilePath);
      voucherSupplyData.id = voucherSupplyId;
      // END CREATE VOUCHER SUPPLY

      // SET VOUCHER SUPPLY METADATA
      const response = await api
          .withToken(gcloudToken)
          .voucherSupplies()
          .setMetadata(null); // force failure
      // SET VOUCHER SUPPLY METADATA

      expect(response.status).to.eql(400);
    });

    it("updateVoucherSupplyOnTransfer - singular - returns 200 and the success status", async () => {
      const gcloudToken = await prerequisites.getGCloudToken(gcloudSecret, tokenSecret);

      // CREATE VOUCHER SUPPLY
      const [token, voucherSupplyData, imageFilePath] = await prerequisites.createVoucherSupplyData();
      const [voucherSupplyId, voucherSupplyOwner, qty, supplyTokenId] = await prerequisites.createVoucherSupply(token, voucherSupplyData, imageFilePath);
      // END CREATE VOUCHER SUPPLY

      // COMMIT TO BUY
      const voucherMetadata = prerequisites.createVoucherMetadata(voucherSupplyOwner);
      const [createVoucherResponseCode, createVoucherResponseBody] = await prerequisites.createVoucher(token, voucherSupplyId, voucherMetadata);
      voucherMetadata._promiseId = Random.promiseId();
      // END COMMIT TO BUY

      const voucherSupplies = [supplyTokenId];
      const quantities = [qty];
      const voucherOwner = voucherMetadata._holder;

      const data = prerequisites.createSupplyUpdateTransferData(voucherMetadata, voucherSupplies, quantities, voucherOwner);

      // UPDATE VOUCHER SUPPLY ON CANCEL
      const response = await api
          .withToken(gcloudToken)
          .voucherSupplies()
          .updateOnTransfer(data);

      const expectedPropertyName = "success";
      const propertyNames = Object.getOwnPropertyNames(response.body);
      // END UPDATE VOUCHER SUPPLY ON CANCEL

      expect(response.status).to.eql(200);
      expect(propertyNames).to.include(expectedPropertyName);
      expect(response.body[expectedPropertyName]).to.eql(true);
    });

    it("updateVoucherSupplyOnTransfer - batch - returns 200 and the success status", async () => {
      const gcloudToken = await prerequisites.getGCloudToken(gcloudSecret, tokenSecret);

      // CREATE VOUCHER SUPPLIES
      const [token, voucherSupplyData, imageFilePath] = await prerequisites.createVoucherSupplyData();
      const [voucherSupplyId1, voucherSupplyOwner1, qty1, supplyTokenId1] = await prerequisites.createVoucherSupply(token, voucherSupplyData, imageFilePath);
      const [voucherSupplyId2, voucherSupplyOwner2, qty2, supplyTokenId2] = await prerequisites.createVoucherSupply(token, voucherSupplyData, imageFilePath);
      // END CREATE VOUCHER SUPPLIES

      // COMMIT TO BUY
      const voucherMetadata = prerequisites.createVoucherMetadata(voucherSupplyOwner1);
      const [createVoucherResponseCode, createVoucherResponseBody] = await prerequisites.createVoucher(token, voucherSupplyId1, voucherMetadata);
      voucherMetadata._promiseId = Random.promiseId();
      // END COMMIT TO BUY

      const voucherSupplies = [supplyTokenId1, supplyTokenId2];
      const quantities = [qty1, qty2];
      const voucherOwner = voucherMetadata._holder;

      const data = prerequisites.createSupplyUpdateTransferData(voucherMetadata, voucherSupplies, quantities, voucherOwner);

      // UPDATE VOUCHER SUPPLY ON CANCEL
      const response = await api
          .withToken(gcloudToken)
          .voucherSupplies()
          .updateOnTransfer(data);

      const expectedPropertyName = "success";
      const propertyNames = Object.getOwnPropertyNames(response.body);
      // END UPDATE VOUCHER SUPPLY ON CANCEL

      expect(response.status).to.eql(200);
      expect(propertyNames).to.include(expectedPropertyName);
      expect(response.body[expectedPropertyName]).to.eql(true);
    });

    it("updateVoucherSupplyOnTransfer - singular - returns 400 when metadata is null", async () => {
      const gcloudToken = await prerequisites.getGCloudToken(gcloudSecret, tokenSecret);

      // CREATE VOUCHER SUPPLY
      const [token, voucherSupplyData, imageFilePath] = await prerequisites.createVoucherSupplyData();
      const [voucherSupplyId, voucherSupplyOwner, qty, supplyTokenId] = await prerequisites.createVoucherSupply(token, voucherSupplyData, imageFilePath);
      // END CREATE VOUCHER SUPPLY

      // COMMIT TO BUY
      const voucherMetadata = prerequisites.createVoucherMetadata(voucherSupplyOwner);
      const [createVoucherResponseCode, createVoucherResponseBody] = await prerequisites.createVoucher(token, voucherSupplyId, voucherMetadata);
      voucherMetadata._promiseId = Random.promiseId();
      // END COMMIT TO BUY

      // UPDATE VOUCHER SUPPLY ON CANCEL
      const response = await api
          .withToken(gcloudToken)
          .voucherSupplies()
          .updateOnTransfer(null); // force failure
      // END UPDATE VOUCHER SUPPLY ON CANCEL

      expect(response.status).to.eql(400);
    });

    it("updateVoucherSupplyOnTransfer - singular - returns 400 when voucherOwner is null", async () => {
      const gcloudToken = await prerequisites.getGCloudToken(gcloudSecret, tokenSecret);

      // CREATE VOUCHER SUPPLY
      const [token, voucherSupplyData, imageFilePath] = await prerequisites.createVoucherSupplyData();
      const [voucherSupplyId, voucherSupplyOwner, qty, supplyTokenId] = await prerequisites.createVoucherSupply(token, voucherSupplyData, imageFilePath);
      // END CREATE VOUCHER SUPPLY

      // COMMIT TO BUY
      const voucherMetadata = prerequisites.createVoucherMetadata(voucherSupplyOwner);
      const [createVoucherResponseCode, createVoucherResponseBody] = await prerequisites.createVoucher(token, voucherSupplyId, voucherMetadata);
      voucherMetadata._promiseId = Random.promiseId();
      // END COMMIT TO BUY

      const voucherSupplies = [supplyTokenId];
      const quantities = [qty];
      const voucherOwner = null; // force failure

      const data = prerequisites.createSupplyUpdateTransferData(voucherMetadata, voucherSupplies, quantities, voucherOwner);

      // UPDATE VOUCHER SUPPLY ON CANCEL
      const response = await api
          .withToken(gcloudToken)
          .voucherSupplies()
          .updateOnTransfer(data); // force failure
      // END UPDATE VOUCHER SUPPLY ON CANCEL

      expect(response.status).to.eql(400);
    });

    it("updateVoucherSupplyOnTransfer - singular - returns 400 when voucherSupplies is null", async () => {
      const gcloudToken = await prerequisites.getGCloudToken(gcloudSecret, tokenSecret);

      // CREATE VOUCHER SUPPLY
      const [token, voucherSupplyData, imageFilePath] = await prerequisites.createVoucherSupplyData();
      const [voucherSupplyId, voucherSupplyOwner, qty, supplyTokenId] = await prerequisites.createVoucherSupply(token, voucherSupplyData, imageFilePath);
      // END CREATE VOUCHER SUPPLY

      // COMMIT TO BUY
      const voucherMetadata = prerequisites.createVoucherMetadata(voucherSupplyOwner);
      const [createVoucherResponseCode, createVoucherResponseBody] = await prerequisites.createVoucher(token, voucherSupplyId, voucherMetadata);
      voucherMetadata._promiseId = Random.promiseId();
      // END COMMIT TO BUY

      const voucherSupplies = null; // force failure
      const quantities = [qty];
      const voucherOwner = voucherMetadata._holder;

      const data = prerequisites.createSupplyUpdateTransferData(voucherMetadata, voucherSupplies, quantities, voucherOwner);

      // UPDATE VOUCHER SUPPLY ON CANCEL
      const response = await api
          .withToken(gcloudToken)
          .voucherSupplies()
          .updateOnTransfer(data); // force failure
      // END UPDATE VOUCHER SUPPLY ON CANCEL

      expect(response.status).to.eql(400);
    });

    it("updateVoucherSupplyOnTransfer - singular - returns 400 when voucherSupplies is empty", async () => {
      const gcloudToken = await prerequisites.getGCloudToken(gcloudSecret, tokenSecret);

      // CREATE VOUCHER SUPPLY
      const [token, voucherSupplyData, imageFilePath] = await prerequisites.createVoucherSupplyData();
      const [voucherSupplyId, voucherSupplyOwner, qty, supplyTokenId] = await prerequisites.createVoucherSupply(token, voucherSupplyData, imageFilePath);
      // END CREATE VOUCHER SUPPLY

      // COMMIT TO BUY
      const voucherMetadata = prerequisites.createVoucherMetadata(voucherSupplyOwner);
      const [createVoucherResponseCode, createVoucherResponseBody] = await prerequisites.createVoucher(token, voucherSupplyId, voucherMetadata);
      voucherMetadata._promiseId = Random.promiseId();
      // END COMMIT TO BUY

      const voucherSupplies = []; // force failure
      const quantities = [qty];
      const voucherOwner = voucherMetadata._holder;

      const data = prerequisites.createSupplyUpdateTransferData(voucherMetadata, voucherSupplies, quantities, voucherOwner);

      // UPDATE VOUCHER SUPPLY ON CANCEL
      const response = await api
          .withToken(gcloudToken)
          .voucherSupplies()
          .updateOnTransfer(data); // force failure
      // END UPDATE VOUCHER SUPPLY ON CANCEL

      expect(response.status).to.eql(400);
    });

    it("updateVoucherSupplyOnCancel - returns 200 and the success status", async () => {
      const gcloudToken = await prerequisites.getGCloudToken(gcloudSecret, tokenSecret);

      // CREATE VOUCHER SUPPLY
      const [token, voucherSupplyData, imageFilePath] = await prerequisites.createVoucherSupplyData();
      const [voucherSupplyId, voucherSupplyOwner] = await prerequisites.createVoucherSupply(token, voucherSupplyData, imageFilePath);
      // END CREATE VOUCHER SUPPLY

      const data = {
        _tokenIdSupply: voucherSupplyData._tokenIdSupply,
        voucherOwner: voucherSupplyData.voucherOwner,
        qty: voucherSupplyData.qty
      }

      // UPDATE VOUCHER SUPPLY ON CANCEL
      const response = await api
          .withToken(gcloudToken)
          .voucherSupplies()
          .updateOnCancel(data);

      const expectedPropertyName = "success";
      const propertyNames = Object.getOwnPropertyNames(response.body);
      // END UPDATE VOUCHER SUPPLY ON CANCEL

      expect(response.status).to.eql(200);
      expect(propertyNames).to.include(expectedPropertyName);
      expect(response.body[expectedPropertyName]).to.eql(true);
    });

    it("updateVoucherSupplyOnCancel - returns 400 when request body is null", async () => {
      const gcloudToken = await prerequisites.getGCloudToken(gcloudSecret, tokenSecret);

      // CREATE VOUCHER SUPPLY
      const [token, voucherSupplyData, imageFilePath] = await prerequisites.createVoucherSupplyData();
      const [voucherSupplyId, voucherSupplyOwner] = await prerequisites.createVoucherSupply(token, voucherSupplyData, imageFilePath);
      // END CREATE VOUCHER SUPPLY

      const data = null; // force failure

      // UPDATE VOUCHER SUPPLY ON CANCEL
      const response = await api
          .withToken(gcloudToken)
          .voucherSupplies()
          .updateOnCancel(data);
      // END UPDATE VOUCHER SUPPLY ON CANCEL

      expect(response.status).to.eql(400);
    });

    it("updateVoucherSupplyOnCancel - returns 400 when token supply id is null", async () => {
      const gcloudToken = await prerequisites.getGCloudToken(gcloudSecret, tokenSecret);

      // CREATE VOUCHER SUPPLY
      const [token, voucherSupplyData, imageFilePath] = await prerequisites.createVoucherSupplyData();
      const [voucherSupplyId, voucherSupplyOwner] = await prerequisites.createVoucherSupply(token, voucherSupplyData, imageFilePath);
      // END CREATE VOUCHER SUPPLY

      const data = {
        _tokenIdSupply: null, // force failure
        voucherOwner: voucherSupplyData.voucherOwner,
        qty: voucherSupplyData.qty
      }

      // UPDATE VOUCHER SUPPLY ON CANCEL
      const response = await api
          .withToken(gcloudToken)
          .voucherSupplies()
          .updateOnCancel(data);
      // END UPDATE VOUCHER SUPPLY ON CANCEL

      expect(response.status).to.eql(400);
    });

    it("updateVoucherSupplyOnCancel - returns 404 and voucher not found", async () => {
      const gcloudToken = await prerequisites.getGCloudToken(gcloudSecret, tokenSecret);

      // CREATE VOUCHER SUPPLY
      const [token, voucherSupplyData, imageFilePath] = await prerequisites.createVoucherSupplyData();
      const [voucherSupplyId, voucherSupplyOwner] = await prerequisites.createVoucherSupply(token, voucherSupplyData, imageFilePath);
      // END CREATE VOUCHER SUPPLY

      const data = {
        _tokenIdSupply: Random.uint256(), // force failure
        voucherOwner: voucherSupplyData.voucherOwner,
        qty: voucherSupplyData.qty
      }

      // UPDATE VOUCHER SUPPLY ON CANCEL
      const response = await api
          .withToken(gcloudToken)
          .voucherSupplies()
          .updateOnCancel(data);
      // END UPDATE VOUCHER SUPPLY ON CANCEL

      expect(response.status).to.eql(404);
    });
  });

  context("on DELETE", () => {
    it("deleteVoucherSupply - returns 200 and deletes the voucher supply", async () => {
      const expectedPropertyName = "success";

      // CREATE VOUCHER SUPPLY
      const [token, voucherSupplyData, imageFilePath] = await prerequisites.createVoucherSupplyData();
      const [voucherSupplyId, voucherSupplyOwner] = await prerequisites.createVoucherSupply(token, voucherSupplyData, imageFilePath);
      // END CREATE VOUCHER SUPPLY

      // DELETE VOUCHER SUPPLY
      const response = await api
          .withToken(token)
          .voucherSupplies()
          .delete(voucherSupplyId)
      const propertyNames = Object.getOwnPropertyNames(response.body);
      // END OF DELETE

      expect(response.status).to.eql(200);
      expect(propertyNames).to.include(expectedPropertyName);
      expect(response.body[expectedPropertyName]).to.eql(true); // expect success = true
    });

    it("deleteVoucherSupply - returns 400 and voucher supply can't be deleted as it doesn't exist", async () => {
      const account = Random.account();
      const token = await prerequisites.getUserToken(account);
      const randomVoucherSupplyId = Random.voucherSupplyId(); // create random instead of extracting

      // DELETE VOUCHER SUPPLY
      const response = await api
          .withToken(token)
          .voucherSupplies()
          .delete(randomVoucherSupplyId)
      // END OF DELETE

      expect(response.status).to.eql(400);
    });

    it("deleteVoucherSupplyImage - returns 200 and deletes the voucher supply image", async () => {
      const expectedPropertyName = "success";

      // CREATE VOUCHER SUPPLY
      const [token, voucherSupplyData, imageFilePath] = await prerequisites.createVoucherSupplyData();
      const [voucherSupplyId, voucherSupplyOwner] = await prerequisites.createVoucherSupply(token, voucherSupplyData, imageFilePath);
      // END CREATE VOUCHER SUPPLY

      const imageFilePathTokens = imageFilePath.split("/");
      const imageName = imageFilePathTokens[imageFilePathTokens.length - 1];
      const imageUrl = `https://boson.example.com/${imageName}`;

      // DELETE VOUCHER SUPPLY IMAGE
      const response = await api
          .withToken(token)
          .voucherSupplies()
          .deleteImage(voucherSupplyId, imageUrl)
      const propertyNames = Object.getOwnPropertyNames(response.body);
      // END OF DELETE

      // QUERY FOR VOUCHER - After Delete
      const responseVoucherQuery2 = await api
          .voucherSupplies()
          .getById(voucherSupplyId);
      const vsImagesAfter = responseVoucherQuery2.body.voucherSupply.imagefiles;
      const vsImageUrlsAfterDelete = vsImagesAfter.map(image => image.url); // extract Url for expect comparison with image Url
      // END QUERY - After Delete

      expect(response.status).to.eql(200);
      expect(propertyNames).to.include(expectedPropertyName);
      expect(response.body[expectedPropertyName]).to.eql(true); // expect success = true
      expect(vsImageUrlsAfterDelete).not.include(imageUrl); // expect image Urls to not include the image Url after deletion
    });

    it("deleteVoucherSupplyImage - returns 400 and image can't be deleted because voucher supply doesn't exist", async () => {
      const account = Random.account();
      const token = await prerequisites.getUserToken(account);
      const randomVoucherSupplyId = Random.voucherSupplyId(); // create random instead of extracting

      // DELETE VOUCHER SUPPLY
      const response = await api
          .withToken(token)
          .voucherSupplies()
          .deleteImage(randomVoucherSupplyId)
      // END OF DELETE

      expect(response.status).to.eql(400);
    });
  });
});
