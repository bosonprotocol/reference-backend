const { expect } = require("chai");

const Random = require("../shared/helpers/Random");
const Database = require("../shared/helpers/Database");

const TestServer = require("./helpers/TestServer");
const Prerequisites = require("./helpers/Prerequisites");
const API = require("./helpers/API");

const validVoucherStatuses = Object.values(require("../../src/utils/voucherStatuses"));

describe("Vouchers Resource", () => {
    let server;
    let database;
    let prerequisites;
    let api;

    const tokenSecret = Random.tokenSecret();

    before(async () => {
        database = await Database.connect();
        server = await new TestServer()
            .onAnyPort()
            .addConfigurationOverrides({tokenSecret})
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
        it("returns 200 and all vouchers for the given address", async () => {
            const account = Random.account();
            const token = await prerequisites.getUserToken(account);

            const response = await api
                .withToken(token)
                .vouchers()
                .getVouchers();

            const expectedPropertyName = "voucherData";

            const propertyNames = Object.getOwnPropertyNames(response.body);
            const vouchersProperty = response.body[expectedPropertyName];

            expect(response.status).to.eql(200);
            expect(propertyNames).to.include(expectedPropertyName);
            expect(Array.isArray(vouchersProperty)).to.eql(true);
        });

        it("returns 200 and the requested voucher's details", async () => {
            // CREATE VOUCHER SUPPLY
            const [token, voucherSupplyData, imageFilePath] = await prerequisites.createVoucherSupplyData();
            const [voucherSupplyId, voucherSupplyOwner] = await prerequisites.createVoucherSupply(token, voucherSupplyData, imageFilePath);
            // END CREATE VOUCHER SUPPLY

            // COMMIT TO BUY
            const voucherMetadata = prerequisites.createVoucherMetadata(voucherSupplyOwner); // override voucher holder to given address
            const [createVoucherResponseCode, createVoucherResponseBody] = await prerequisites.createVoucher(token, voucherSupplyId, voucherMetadata);
            // END COMMIT TO BUY

            const voucherId = createVoucherResponseBody.voucherID; // extract voucher ID

            const response = await api
                .withToken(token)
                .vouchers()
                .getVoucherDetails(voucherId);

            expect(response.status).to.eql(200);
            expect(response.body.voucher._id).to.eql(voucherId); // check that IDs match
        });

        it("returns 200 and all bought vouchers for the given supply ID", async () => {
            const account = Random.account();
            const token = await prerequisites.getUserToken(account);
            const supplyId = Random.voucherSupplyId();

            const response = await api
                .withToken(token)
                .vouchers()
                .getBoughtVouchers(supplyId);

            const expectedPropertyName = "vouchers";

            const propertyNames = Object.getOwnPropertyNames(response.body);
            const vouchersProperty = response.body[expectedPropertyName];

            expect(response.status).to.eql(200);
            expect(propertyNames).to.include(expectedPropertyName);
            expect(Array.isArray(vouchersProperty)).to.eql(true);
        });

        it("returns 200 and all public vouchers", async () => {
            const response = await api.vouchers().getAllPublic();
            const expectedPropertyName = "vouchers";

            const propertyNames = Object.getOwnPropertyNames(response.body);
            const vouchersProperty = response.body[expectedPropertyName];

            expect(response.status).to.eql(200);
            expect(propertyNames).to.include(expectedPropertyName);
            expect(Array.isArray(vouchersProperty)).to.eql(true);
        });
    });

    context("on PATCH", () => {
        it("returns 200 and voucher updated success status", async () => {
            const expectedPropertyName = "updated";

            // CREATE VOUCHER SUPPLY
            const [token, voucherSupplyData, imageFilePath] = await prerequisites.createVoucherSupplyData();
            const [voucherSupplyId, voucherSupplyOwner] = await prerequisites.createVoucherSupply(token, voucherSupplyData, imageFilePath);
            // END CREATE VOUCHER SUPPLY

            // COMMIT TO BUY
            const voucherMetadata = prerequisites.createVoucherMetadata(voucherSupplyOwner);
            const [createVoucherResponseCode, createVoucherResponseBody] = await prerequisites.createVoucher(token, voucherSupplyId, voucherMetadata);
            // END COMMIT TO BUY

            const newStatus = validVoucherStatuses[0]; // change to guaranteed valid status
            const voucherId = createVoucherResponseBody.voucherID;

            const response = await api
                .withToken(token)
                .vouchers()
                .update(newStatus, voucherId);

            const propertyNames = Object.getOwnPropertyNames(response.body);

            expect(response.status).to.eql(200);
            expect(propertyNames).to.include(expectedPropertyName);
            expect(response.body[expectedPropertyName]).to.eql(true);
        });

        it("returns 400 on voucher update to invalid status", async () => {
            // CREATE VOUCHER SUPPLY
            const [token, voucherSupplyData, imageFilePath] = await prerequisites.createVoucherSupplyData();
            const [voucherSupplyId, voucherSupplyOwner] = await prerequisites.createVoucherSupply(token, voucherSupplyData, imageFilePath);
            // END CREATE VOUCHER SUPPLY

            // COMMIT TO BUY
            const voucherMetadata = prerequisites.createVoucherMetadata(voucherSupplyOwner);
            const [createVoucherResponseCode, createVoucherResponseBody] = await prerequisites.createVoucher(token, voucherSupplyId, voucherMetadata);
            // END COMMIT TO BUY

            const newStatus = "FAKE_INVALID_STATUS_TEST"; // change to invalid status
            const voucherId = createVoucherResponseBody.voucherID;

            const response = await api
                .withToken(token)
                .vouchers()
                .update(newStatus, voucherId);

            expect(response.status).to.eql(400);
        });
    });

    context("on POST", () => {
        it("returns 200 with the voucher ID", async () => {
            // CREATE VOUCHER SUPPLY
            const [token, voucherSupplyData, imageFilePath] = await prerequisites.createVoucherSupplyData();
            const [voucherSupplyId, voucherSupplyOwner] = await prerequisites.createVoucherSupply(token, voucherSupplyData, imageFilePath);
            // END CREATE VOUCHER SUPPLY

            // COMMIT TO BUY
            const voucherMetadata = prerequisites.createVoucherMetadata(voucherSupplyOwner);
            const [createVoucherResponseCode, createVoucherResponseBody] = await prerequisites.createVoucher(token, voucherSupplyId, voucherMetadata);
            // END COMMIT TO BUY

            const expectedPropertyName = "voucherID";
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