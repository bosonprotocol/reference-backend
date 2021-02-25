const { expect } = require("chai");

const Random = require("../shared/helpers/Random");
const Database = require("../shared/helpers/Database");

const TestServer = require("./helpers/TestServer");
const Prerequisites = require("./helpers/Prerequisites");
const API = require("./helpers/API");

describe("Payments Resource", () => {
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

  context("on GET", () => {
    it("getPaymentsByVoucherTokenId - returns 200 and all payments for the given voucherTokenId", async () => {
      // CREATE VOUCHER SUPPLY
      const [
        token,
        voucherSupplyData,
        imageFilePath,
      ] = await prerequisites.createVoucherSupplyData();
      const [
        voucherSupplyId,
        voucherSupplyOwner,
      ] = await prerequisites.createVoucherSupply(
        token,
        voucherSupplyData,
        imageFilePath
      );
      // END CREATE VOUCHER SUPPLY

      // CREATE VOUCHER
      const voucherMetadata = prerequisites.createVoucherMetadata(
        voucherSupplyOwner
      );
      await prerequisites.createVoucher(
        token,
        voucherSupplyId,
        voucherMetadata
      );
      // END CREATE VOUCHER

      const voucherTokenId = voucherMetadata._tokenIdVoucher;

      // CREATE PAYMENT
      const paymentsMetadata = [
        Random.paymentMetadata({ _tokenIdVoucher: voucherTokenId }),
      ]; // override with correct id
      await prerequisites.createPayment(token, paymentsMetadata);
      // END CREATE PAYMENT

      const response = await api.payments().getByVoucherId(voucherTokenId);

      const paymentsVoucherTokenId = response.body.payments[0]._tokenIdVoucher;

      expect(response.status).to.eql(200);
      expect(paymentsVoucherTokenId).to.eql(voucherTokenId); // match on token id to verify associated payment
    });

    it("getPaymentActors - returns 200 and all payment actors for the given voucherTokenId", async () => {
      // CREATE VOUCHER SUPPLY
      const [
        token,
        voucherSupplyData,
        imageFilePath,
      ] = await prerequisites.createVoucherSupplyData();
      const [
        voucherSupplyId,
        voucherSupplyOwner,
      ] = await prerequisites.createVoucherSupply(
        token,
        voucherSupplyData,
        imageFilePath
      );
      // END CREATE VOUCHER SUPPLY

      // CREATE VOUCHER
      const voucherMetadata = prerequisites.createVoucherMetadata(
        voucherSupplyOwner
      );
      const [, createVoucherResponseBody] = await prerequisites.createVoucher(
        token,
        voucherSupplyId,
        voucherMetadata
      );
      // END CREATE VOUCHER

      const voucherTokenId = voucherMetadata._tokenIdVoucher;
      const voucherId = createVoucherResponseBody.voucherID;

      // CREATE PAYMENT
      const paymentsMetadata = [
        Random.paymentMetadata({ _tokenIdVoucher: voucherTokenId }),
      ]; // override with correct id
      await prerequisites.createPayment(token, paymentsMetadata);
      // END CREATE PAYMENT

      const response = await api.payments().getActors(voucherId);

      const expectedPropertyName = "distributedAmounts";
      const propertyNames = Object.getOwnPropertyNames(response.body);

      expect(response.status).to.eql(200);
      expect(propertyNames).to.include(expectedPropertyName);
    });

    it("getPaymentActors - returns 400 when voucherId is invalid", async () => {
      // CREATE VOUCHER SUPPLY
      const [
        token,
        voucherSupplyData,
        imageFilePath,
      ] = await prerequisites.createVoucherSupplyData();
      const [
        voucherSupplyId,
        voucherSupplyOwner,
      ] = await prerequisites.createVoucherSupply(
        token,
        voucherSupplyData,
        imageFilePath
      );
      // END CREATE VOUCHER SUPPLY

      // CREATE VOUCHER
      const voucherMetadata = prerequisites.createVoucherMetadata(
        voucherSupplyOwner
      );
      await prerequisites.createVoucher(
        token,
        voucherSupplyId,
        voucherMetadata
      );
      // END CREATE VOUCHER

      const voucherTokenId = voucherMetadata._tokenIdVoucher;
      const voucherId = "FAKE_INVALID_VOUCHER_ID";

      // CREATE PAYMENT
      const paymentsMetadata = [
        Random.paymentMetadata({ _tokenIdVoucher: voucherTokenId }),
      ]; // override with correct id
      await prerequisites.createPayment(token, paymentsMetadata);
      // END CREATE PAYMENT

      const response = await api.payments().getActors(voucherId);

      expect(response.status).to.eql(400);
    });
  });

  context("on POST", () => {
    it("createPayment - returns 200 and all payments for the given voucherTokenId", async () => {
      // CREATE VOUCHER SUPPLY
      const [
        token,
        voucherSupplyData,
        imageFilePath,
      ] = await prerequisites.createVoucherSupplyData();
      const [
        voucherSupplyId,
        voucherSupplyOwner,
      ] = await prerequisites.createVoucherSupply(
        token,
        voucherSupplyData,
        imageFilePath
      );
      // END CREATE VOUCHER SUPPLY

      // CREATE VOUCHER
      const voucherMetadata = prerequisites.createVoucherMetadata(
        voucherSupplyOwner
      );
      await prerequisites.createVoucher(
        token,
        voucherSupplyId,
        voucherMetadata
      );
      // END CREATE VOUCHER

      // CREATE PAYMENT
      const paymentsMetadata = [Random.paymentMetadata()]; // must be array
      const [
        paymentResponseCode,
        paymentResponseBody,
      ] = await prerequisites.createPayment(token, paymentsMetadata);
      // END CREATE PAYMENT

      const expectedPropertyName = "updated";
      const propertyNames = Object.getOwnPropertyNames(paymentResponseBody);

      expect(paymentResponseCode).to.eql(200);
      expect(propertyNames).to.include(expectedPropertyName);
      expect(paymentResponseBody[expectedPropertyName]).to.eql(true);
    });

    it("createPayment - returns 400 when paymentMetadata is not an array", async () => {
      // CREATE VOUCHER SUPPLY
      const [
        token,
        voucherSupplyData,
        imageFilePath,
      ] = await prerequisites.createVoucherSupplyData();
      const [
        voucherSupplyId,
        voucherSupplyOwner,
      ] = await prerequisites.createVoucherSupply(
        token,
        voucherSupplyData,
        imageFilePath
      );
      // END CREATE VOUCHER SUPPLY

      // CREATE VOUCHER
      const voucherMetadata = prerequisites.createVoucherMetadata(
        voucherSupplyOwner
      );
      await prerequisites.createVoucher(
        token,
        voucherSupplyId,
        voucherMetadata
      );
      // END CREATE VOUCHER

      // CREATE PAYMENT
      const paymentsMetadata = Random.paymentMetadata(); // force failure
      const [paymentResponseCode] = await prerequisites.createPayment(
        token,
        paymentsMetadata
      );
      // END CREATE PAYMENT

      expect(paymentResponseCode).to.eql(400);
    });

    it("createPayment - returns 400 when paymentsMetadata elements are not objects", async () => {
      // CREATE VOUCHER SUPPLY
      const [
        token,
        voucherSupplyData,
        imageFilePath,
      ] = await prerequisites.createVoucherSupplyData();
      const [
        voucherSupplyId,
        voucherSupplyOwner,
      ] = await prerequisites.createVoucherSupply(
        token,
        voucherSupplyData,
        imageFilePath
      );
      // END CREATE VOUCHER SUPPLY

      // CREATE VOUCHER
      const voucherMetadata = prerequisites.createVoucherMetadata(
        voucherSupplyOwner
      );
      await prerequisites.createVoucher(
        token,
        voucherSupplyId,
        voucherMetadata
      );
      // END CREATE VOUCHER

      // CREATE PAYMENT
      const paymentsMetadata = ["FAKE_PAYMENTS_METADATA_NOT_AN_OBJECT"]; // force failure
      const [paymentResponseCode] = await prerequisites.createPayment(
        token,
        paymentsMetadata
      );
      // END CREATE PAYMENT

      expect(paymentResponseCode).to.eql(400);
    });

    it("createPayment - returns 400 when paymentsMetadata elements don't contain voucherTokenId", async () => {
      // CREATE VOUCHER SUPPLY
      const [
        token,
        voucherSupplyData,
        imageFilePath,
      ] = await prerequisites.createVoucherSupplyData();
      const [
        voucherSupplyId,
        voucherSupplyOwner,
      ] = await prerequisites.createVoucherSupply(
        token,
        voucherSupplyData,
        imageFilePath
      );
      // END CREATE VOUCHER SUPPLY

      // CREATE VOUCHER
      const voucherMetadata = prerequisites.createVoucherMetadata(
        voucherSupplyOwner
      );
      await prerequisites.createVoucher(
        token,
        voucherSupplyId,
        voucherMetadata
      );
      // END CREATE VOUCHER

      const paymentMetadata = Random.paymentMetadata();
      delete paymentMetadata._tokenIdVoucher; // force failure by removing _tokenIdVoucher property

      // CREATE PAYMENT
      const paymentsMetadata = [paymentMetadata];
      const [paymentResponseCode] = await prerequisites.createPayment(
        token,
        paymentsMetadata
      );
      // END CREATE PAYMENT

      expect(paymentResponseCode).to.eql(400);
    });

    it("createPayment - returns 400 when paymentsMetadata contains invalid voucherTokenId", async () => {
      // CREATE VOUCHER SUPPLY
      const [
        token,
        voucherSupplyData,
        imageFilePath,
      ] = await prerequisites.createVoucherSupplyData();
      const [
        voucherSupplyId,
        voucherSupplyOwner,
      ] = await prerequisites.createVoucherSupply(
        token,
        voucherSupplyData,
        imageFilePath
      );
      // END CREATE VOUCHER SUPPLY

      // CREATE VOUCHER
      const voucherMetadata = prerequisites.createVoucherMetadata(
        voucherSupplyOwner
      );
      await prerequisites.createVoucher(
        token,
        voucherSupplyId,
        voucherMetadata
      );
      // END CREATE VOUCHER

      const paymentMetadata = Random.paymentMetadata();
      paymentMetadata._tokenIdVoucher = null; // force failure

      // CREATE PAYMENT
      const paymentsMetadata = [paymentMetadata];
      const [paymentResponseCode] = await prerequisites.createPayment(
        token,
        paymentsMetadata
      );
      // END CREATE PAYMENT

      expect(paymentResponseCode).to.eql(400);
    });
  });
});
