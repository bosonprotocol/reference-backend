const { expect } = require("chai");

const Random = require("../shared/helpers/Random");
const Database = require("../shared/helpers/Database");

const TestServer = require("./helpers/TestServer");
const Prerequisites = require("./helpers/Prerequisites");
const API = require("./helpers/API");

describe("Events Resource", () => {
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

  context("on GET", () => {
    it("getAllEvents - returns 200 and all vouchers", async () => {
      const response = await api.events().getAll();

      const expectedProperty1 = "succeeded";
      const expectedProperty2 = "failed";
      const expectedProperty3 = "events";

      const propertyNames = Object.getOwnPropertyNames(response.body);
      const eventsProperty = response.body[expectedProperty3];

      expect(response.status).to.eql(200);
      expect(propertyNames).to.include(expectedProperty1);
      expect(propertyNames).to.include(expectedProperty2);
      expect(propertyNames).to.include(expectedProperty3);
      expect(Array.isArray(eventsProperty)).to.eql(true);
    });

    it("getDetected - returns 200 and all vouchers", async () => {
      const response = await api.events().getDetected();

      const expectedProperty1 = "succeeded";
      const expectedProperty2 = "events";

      const propertyNames = Object.getOwnPropertyNames(response.body);
      const eventsProperty = response.body[expectedProperty2];

      expect(response.status).to.eql(200);
      expect(propertyNames).to.include(expectedProperty1);
      expect(propertyNames).to.include(expectedProperty2);
      expect(Array.isArray(eventsProperty)).to.eql(true);
    });

    it("getFailed - returns 200 and all vouchers", async () => {
      const response = await api.events().getFailed();

      const expectedProperty1 = "failed";
      const expectedProperty2 = "events";

      const propertyNames = Object.getOwnPropertyNames(response.body);
      const eventsProperty = response.body[expectedProperty2];

      expect(response.status).to.eql(200);
      expect(propertyNames).to.include(expectedProperty1);
      expect(propertyNames).to.include(expectedProperty2);
      expect(Array.isArray(eventsProperty)).to.eql(true);
    });
  });

  context("on PATCH", () => {
    it("updateEventByCorrelationId - returns 200 and voucher updated success status", async () => {
      const account = Random.account();
      const token = await prerequisites.getUserToken(account);

      const gcloudToken = await prerequisites.getGCloudToken(
        gcloudSecret,
        tokenSecret
      );

      const metadata = Random.eventMetadata({
        _tokenId: "",
        address: account.address,
      });

      await api.withToken(token).events().createEvent(metadata);

      const updatedData = {
        name: metadata.name,
        address: metadata.address,
        _correlationId: metadata._correlationId,
      };

      const response = await api
        .withToken(gcloudToken)
        .events()
        .updateByCorrelationId(updatedData);

      const expectedPropertyName = "updated";
      const propertyNames = Object.getOwnPropertyNames(response.body);

      expect(response.status).to.eql(200);
      expect(propertyNames).to.include(expectedPropertyName);
      expect(response.body[expectedPropertyName]).to.eql(true);
    });

    it("updateEventByTokenId - returns 200 and voucher updated success status", async () => {
      const account = Random.account();
      const token = await prerequisites.getUserToken(account);

      const gcloudToken = await prerequisites.getGCloudToken(
        gcloudSecret,
        tokenSecret
      );

      const metadata = Random.eventMetadata({
        address: account.address,
        _correlationId: "",
      });

      await api.withToken(token).events().createEvent(metadata);

      const updatedData = {
        name: metadata.name,
        _tokenId: metadata._tokenId,
      };

      const response = await api
        .withToken(gcloudToken)
        .events()
        .updateByTokenId(updatedData);

      const expectedPropertyName = "updated";
      const propertyNames = Object.getOwnPropertyNames(response.body);

      expect(response.status).to.eql(200);
      expect(propertyNames).to.include(expectedPropertyName);
      expect(response.body[expectedPropertyName]).to.eql(true);
    });
  });

  context("on POST", () => {
    it("createEvent - returns 200 with eventId", async () => {
      const address = Random.account();
      const token = await prerequisites.getUserToken(address);

      const metadata = Random.eventMetadata({
        _tokenId: "",
      });

      const response = await api
        .withToken(token)
        .events()
        .createEvent(metadata);

      const expectedPropertyName = "eventId";
      const propertyNames = Object.getOwnPropertyNames(response.body);

      expect(response.status).to.eql(201);
      expect(propertyNames).to.include(expectedPropertyName);
    });

    it("createEvent - returns 200 with eventId", async () => {
      const address = Random.account();
      const token = await prerequisites.getUserToken(address);

      const metadata = Random.eventMetadata({
        address: "",
        _correlationId: "",
      });

      const response = await api
        .withToken(token)
        .events()
        .createEvent(metadata);

      const expectedPropertyName = "eventId";
      const propertyNames = Object.getOwnPropertyNames(response.body);

      expect(response.status).to.eql(201);
      expect(propertyNames).to.include(expectedPropertyName);
    });

    it("createEvent - returns 400 if event name is missing", async () => {
      const account = Random.account();
      const token = await prerequisites.getUserToken(account);

      const metadata = Random.eventMetadata({ name: "" });

      const response = await api
        .withToken(token)
        .events()
        .createEvent(metadata);
      expect(response.status).to.eql(400);
    });

    it("createEvent - returns 400 if  _correlationId and _tokenId are missing", async () => {
      const account = Random.account();
      const token = await prerequisites.getUserToken(account);

      const metadata = Random.eventMetadata({
        _correlationId: "",
        _tokenId: "",
      });

      const response = await api
        .withToken(token)
        .events()
        .createEvent(metadata);

      expect(response.status).to.eql(400);
    });
  });
});
