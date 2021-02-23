const { expect } = require("chai");

const Random = require("../shared/helpers/Random");
const Database = require("../shared/helpers/Database");

const TestServer = require("./helpers/TestServer");
const Prerequisites = require("./helpers/Prerequisites");
const API = require("./helpers/API");

describe("Administration Resource", () => {
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

    context("on PATCH", () => {
        // it("returns 200 and the address' admin update status", async () => {
        //     // STEP 1 - REGISTER A USER AS ADMIN
        //     // STEP 2 - REGISTER ANOTHER USER AS NON-ADMIN
        //     // STEP 3 - USE ADMIN USER TO MAKE REQUEST TO MAKE USER 2 AN ADMIN
        //     // STEP 4 - CHECK RESPONSE CODE AND SUCCESS STATUS
        //
        //
        //     // REGISTER USER AS ADMIN
        //     const account = Random.account();
        //     const token = await prerequisites.getUserToken(account);
        //     const address = account.address;
        //
        //     const responseRegister = await api.users().post(address);
        //     console.log(responseRegister.body)
        //     // END REGISTER USER AS ADMIN
        //
        //     // REGISTER ANOTHER USER AS NON-ADMIN
        //     const user2Address = Random.address();
        //     const responseRegisterUser2 = await api.users().post(user2Address);
        //     console.log(responseRegisterUser2.body)
        //     // END REGISTER ANOTHER USER AS NON-ADMIN
        //
        //     // USE ADMIN USER TO MAKE REQUEST TO MAKE USER 2 AN ADMIN
        //     // END USE ADMIN USER TO MAKE REQUEST TO MAKE USER 2 AN ADMIN
        //
        //     const expectedPropertyName = "success";
        //
        //     const response = await api
        //         .withToken(token)
        //         .administration()
        //         .makeAdmin(account.address);
        //
        //     console.log(response.body)
        //
        //     expect(response.status).to.eql(200);
        //     // expect(propertyNames).to.include(expectedPropertyName);
        //     // expect(response.body[expectedPropertyName]).to.eql(true); // expect success = true
        // });
    });
});