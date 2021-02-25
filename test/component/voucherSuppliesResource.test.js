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
      const [
        token,
        voucherSupplyData,
        imageFilePath,
      ] = await prerequisites.createVoucherSupplyData();

      const response = await api
        .withToken(token)
        .voucherSupplies()
        .post(voucherSupplyData, imageFilePath);

      expect(response.status).to.eql(201);
    });
  });

  context("on GET", () => {
    it("returns 200 and all voucher supplies", async () => {
      const response = await api.voucherSupplies().getAll();
      const expectedPropertyName = "voucherSupplies";

      const propertyNames = Object.getOwnPropertyNames(response.body);
      const voucherSuppliesProperty = response.body[expectedPropertyName];

      expect(response.status).to.eql(200);
      expect(propertyNames).to.include(expectedPropertyName);
      expect(Array.isArray(voucherSuppliesProperty)).to.eql(true);
    });

    it("returns 200 and the requested voucher supply (by ID)", async () => {
      // CREATE VOUCHER SUPPLY
      const [
        token,
        voucherSupplyData,
        imageFilePath,
      ] = await prerequisites.createVoucherSupplyData();
      const [voucherSupplyId] = await prerequisites.createVoucherSupply(
        token,
        voucherSupplyData,
        imageFilePath
      );
      // END CREATE VOUCHER SUPPLY

      // QUERY FOR VOUCHER
      const response = await api.voucherSupplies().getById(voucherSupplyId);

      expect(response.status).to.eql(200);
      expect(response.body.voucherSupply._id).to.eql(voucherSupplyId); // check if queried id matches created id
    });

    it("returns 400 and voucher doesn't exist", async () => {
      const randomVoucherSupplyId = Random.voucherSupplyId(); // create random instead of extracting

      // QUERY FOR VOUCHER
      const response = await api
        .voucherSupplies()
        .getById(randomVoucherSupplyId);

      expect(response.status).to.eql(400);
    });

    it("returns 200 and the statuses of all voucher supplies for the given address", async () => {
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

    it("returns 200 and the active voucher supplies for the given address", async () => {
      const expectedPropertyName = "voucherSupplies";
      const account = Random.account();
      const token = await prerequisites.getUserToken(account);

      const response = await api.withToken(token).voucherSupplies().getActive();

      const propertyNames = Object.getOwnPropertyNames(response.body);

      expect(response.status).to.eql(200);
      expect(propertyNames).to.include(expectedPropertyName);
    });

    it("returns 200 and the inactive voucher supplies for the given address", async () => {
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

    it("returns 200 and the voucher supplies for the given seller", async () => {
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

    it("returns 200 and the voucher supplies for the given buyer", async () => {
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
    it("returns 200 and the voucher supply update status", async () => {
      const expectedPropertyName = "success";

      // CREATE VOUCHER SUPPLY
      const [
        token,
        voucherSupplyData,
        imageFilePath,
      ] = await prerequisites.createVoucherSupplyData();
      const [voucherSupplyId] = await prerequisites.createVoucherSupply(
        token,
        voucherSupplyData,
        imageFilePath
      );
      // END CREATE VOUCHER SUPPLY

      // UPDATE VOUCHER WITH NEW IMAGE
      const newImageFilePath = "test/fixtures/update-image.png";

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

    it("returns 400 with voucher supply does not exist (i.e. invalid ID)", async () => {
      const account = Random.account();
      const token = await prerequisites.getUserToken(account);
      const randomVoucherSupplyId = Random.voucherSupplyId(); // create random instead of extracting
      const newImageFilePath = "test/fixtures/update-image.png";

      const response = await api
        .withToken(token)
        .voucherSupplies()
        .update(randomVoucherSupplyId, newImageFilePath);

      expect(response.status).to.eql(400);
    });
  });

  context("on DELETE", () => {
    it("returns 200 and deletes the voucher supply", async () => {
      const expectedPropertyName = "success";

      // CREATE VOUCHER SUPPLY
      const [
        token,
        voucherSupplyData,
        imageFilePath,
      ] = await prerequisites.createVoucherSupplyData();
      const [voucherSupplyId] = await prerequisites.createVoucherSupply(
        token,
        voucherSupplyData,
        imageFilePath
      );
      // END CREATE VOUCHER SUPPLY

      // DELETE VOUCHER SUPPLY
      const response = await api
        .withToken(token)
        .voucherSupplies()
        .delete(voucherSupplyId);
      const propertyNames = Object.getOwnPropertyNames(response.body);
      // END OF DELETE

      expect(response.status).to.eql(200);
      expect(propertyNames).to.include(expectedPropertyName);
      expect(response.body[expectedPropertyName]).to.eql(true); // expect success = true
    });

    it("returns 400 and voucher supply can't be deleted as it doesn't exist", async () => {
      const account = Random.account();
      const token = await prerequisites.getUserToken(account);
      const randomVoucherSupplyId = Random.voucherSupplyId(); // create random instead of extracting

      // DELETE VOUCHER SUPPLY
      const response = await api
        .withToken(token)
        .voucherSupplies()
        .delete(randomVoucherSupplyId);
      // END OF DELETE

      expect(response.status).to.eql(400);
    });

    it("returns 200 and deletes the voucher supply image", async () => {
      const expectedPropertyName = "success";

      // CREATE VOUCHER SUPPLY
      const [
        token,
        voucherSupplyData,
        imageFilePath,
      ] = await prerequisites.createVoucherSupplyData();
      const [voucherSupplyId] = await prerequisites.createVoucherSupply(
        token,
        voucherSupplyData,
        imageFilePath
      );
      // END CREATE VOUCHER SUPPLY

      const imageFilePathTokens = imageFilePath.split("/");
      const imageName = imageFilePathTokens[imageFilePathTokens.length - 1];
      const imageUrl = `https://boson.example.com/${imageName}`;

      // DELETE VOUCHER SUPPLY IMAGE
      const response = await api
        .withToken(token)
        .voucherSupplies()
        .deleteImage(voucherSupplyId, imageUrl);
      const propertyNames = Object.getOwnPropertyNames(response.body);
      // END OF DELETE

      // QUERY FOR VOUCHER - After Delete
      const responseVoucherQuery2 = await api
        .voucherSupplies()
        .getById(voucherSupplyId);
      const vsImagesAfter = responseVoucherQuery2.body.voucherSupply.imagefiles;
      const vsImageUrlsAfterDelete = vsImagesAfter.map((image) => image.url); // extract Url for expect comparison with image Url
      // END QUERY - After Delete

      expect(response.status).to.eql(200);
      expect(propertyNames).to.include(expectedPropertyName);
      expect(response.body[expectedPropertyName]).to.eql(true); // expect success = true
      expect(vsImageUrlsAfterDelete).not.include(imageUrl); // expect image Urls to not include the image Url after deletion
    });

    it("returns 400 and image can't be deleted because voucher supply doesn't exist", async () => {
      const account = Random.account();
      const token = await prerequisites.getUserToken(account);
      const randomVoucherSupplyId = Random.voucherSupplyId(); // create random instead of extracting

      // DELETE VOUCHER SUPPLY
      const response = await api
        .withToken(token)
        .voucherSupplies()
        .deleteImage(randomVoucherSupplyId);
      // END OF DELETE

      expect(response.status).to.eql(400);
    });
  });
});
