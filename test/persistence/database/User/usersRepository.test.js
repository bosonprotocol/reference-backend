const chai = require("chai");
const mongoose = require("mongoose");
chai.use(require("chai-as-promised"));

const expect = chai.expect;

const ConfigurationService = require("../../../../src/services/configuration-service");
const UsersRepository = require("../../../../src/database/User/users-repository");
const User = require("../../../../src/database/models/User");
const userRoles = require("../../../../src/database/User/user-roles");

describe("Users Repository", () => {
  before(async () => {
    const configurationService = new ConfigurationService();
    const databaseConnectionString =
      configurationService.databaseConnectionString ||
      "mongodb://admin:secret@localhost:27017/admin";
    await mongoose.connect(databaseConnectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterEach(async () => {
    await User.collection.deleteMany({})
  });

  after(async () => {
    await mongoose.disconnect();
  });

  context("createUser", async () => {
    it("stores the user when valid", async () => {
      const address = "0x9b8B1ac5979991E72D61c8C4cB6a95Ecd2d6E706";
      const nonce = 123456;

      const usersRepository = new UsersRepository();
      await usersRepository.createUser(address, nonce);

      const user = await User.findOne({ address });

      expect(user.address).to.eql(address);
      expect(user.nonce).to.eql(nonce);
      expect(user.role).to.eql(userRoles.USER);
    });

    it("fails if nonce is negative", async () => {
      const address = "0x9b8B1ac5979991E72D61c8C4cB6a95Ecd2d6E706";
      const nonce = -123456;

      const usersRepository = new UsersRepository();
      await expect(
        usersRepository.createUser(address, nonce)
      ).to.be.rejectedWith(
        "User validation failed: nonce: Nonce must be a positive number"
      );
    });

    it("fails if nonce is not a number", async () => {
      const address = "0x9b8B1ac5979991E72D61c8C4cB6a95Ecd2d6E706";
      const nonce = "not-a-number";

      const usersRepository = new UsersRepository();
      await expect(
        usersRepository.createUser(address, nonce)
      ).to.be.rejectedWith(
        'User validation failed: nonce: Cast to Number failed for value "not-a-number" at path "nonce"'
      );
    });

    it("uses a nonce of zero when not provided", async () => {
      const address = "0x9b8B1ac5979991E72D61c8C4cB6a95Ecd2d6E706";
      const nonce = undefined;

      const usersRepository = new UsersRepository();
      await usersRepository.createUser(address, nonce);

      const user = await User.findOne({ address });

      expect(user.nonce).to.eql(0);
    });

    it("fails if address is not provided", async () => {
      const address = undefined;
      const nonce = 123456;

      const usersRepository = new UsersRepository();
      await expect(
        usersRepository.createUser(address, nonce)
      ).to.be.rejectedWith(
        "User validation failed: address: Path `address` is required."
      );
    });
  });
});
