const { expect } = require("chai");

const Random = require("../shared/helpers/Random");
const Database = require("../shared/helpers/Database");

const TestServer = require("./helpers/TestServer");
const Prerequisites = require("./helpers/Prerequisites");
const API = require("./helpers/API");

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

        // it("returns 200 and the requested voucher's details", async () => {
        //      REQUIRES CREATE VOUCHER TEST FIRST
        //     const account = Random.account();
        //     const token = await prerequisites.getUserToken(account);
        //     const voucherId = Random.voucherSupplyId();
        //
        //     const response = await api
        //         .withToken(token)
        //         .vouchers()
        //         .getVoucherDetails(voucherId);
        //
        //     expect(response.status).to.eql(200);
        //     expect(response.body.voucher._id).to.eql(voucherId);
        // });

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
});