const chai = require("chai");
chai.use(require("chai-as-promised"));

const expect = chai.expect;

const UsersRepository = require("../../src/database/User/UsersRepository");
const User = require("../../src/database/models/User");
const userRoles = require("../../src/database/User/userRoles");

const Random = require("../shared/helpers/Random");
const Database = require('../shared/helpers/Database')

describe("Users Repository", () => {
  before(async () => {
    await Database.connect();
  });

  afterEach(async () => {
    await Database.truncateCollection(User);
  });

  after(async () => {
    await Database.disconnect();
  });

  context("createUser", () => {
    it("stores the user when valid", async () => {
      const address = Random.address();
      const nonce = Random.nonce();

      const usersRepository = new UsersRepository();
      await usersRepository.createUser(address, nonce);

      const user = await User.findOne({ address });

      expect(user.address).to.eql(address);
      expect(user.nonce).to.eql(nonce);
      expect(user.role).to.eql(userRoles.USER);
    });

    it("fails if nonce is negative", async () => {
      const address = Random.address();
      const nonce = -167463;

      const usersRepository = new UsersRepository();
      await expect(
        usersRepository.createUser(address, nonce)
      ).to.be.rejectedWith(
        "User validation failed: nonce: Nonce must be a positive number"
      );
    });

    it("fails if nonce is not a number", async () => {
      const address = Random.address();
      const nonce = "not-a-number";

      const usersRepository = new UsersRepository();
      await expect(
        usersRepository.createUser(address, nonce)
      ).to.be.rejectedWith(
        'User validation failed: nonce: Cast to Number failed for value "not-a-number" at path "nonce"'
      );
    });

    it("uses a nonce of zero when not provided", async () => {
      const address = Random.address();
      const nonce = undefined;

      const usersRepository = new UsersRepository();
      await usersRepository.createUser(address, nonce);

      const user = await User.findOne({ address });

      expect(user.nonce).to.eql(0);
    });

    it("fails if address is not provided", async () => {
      const address = undefined;
      const nonce = Random.nonce();

      const usersRepository = new UsersRepository();
      await expect(
        usersRepository.createUser(address, nonce)
      ).to.be.rejectedWith(
        "User validation failed: address: Path `address` is required."
      );
    });
  });

  context("preserveNonce", () => {
    it("creates a user and stores the nonce when user doesn't exist", async () => {
      const address = Random.address();
      const nonce = Random.nonce();

      const usersRepository = new UsersRepository();
      await usersRepository.preserveNonce(address, nonce);

      const user = await User.findOne({ address });

      expect(user.nonce).to.eql(nonce);
    });

    it("sets the nonce on a user when user already exists", async () => {
      const address = Random.address();
      const nonce = Random.nonce();

      const usersRepository = new UsersRepository();
      await usersRepository.createUser(address, undefined);

      await usersRepository.preserveNonce(address, nonce);

      const user = await User.findOne({ address });

      expect(user.nonce).to.eql(nonce);
    });

    it("replaces the nonce on subsequent calls", async () => {
      const address = Random.address();
      const firstNonce = Random.nonce();
      const secondNonce = Random.nonce();

      const usersRepository = new UsersRepository();
      await usersRepository.preserveNonce(address, firstNonce);
      await usersRepository.preserveNonce(address, secondNonce);

      const user = await User.findOne({ address });

      expect(user.nonce).to.eql(secondNonce);
    });
  });

  context("getNonce", () => {
    it("gets the nonce when the user exists", async () => {
      const address = Random.address();
      const createdNonce = Random.nonce();

      const usersRepository = new UsersRepository();
      await usersRepository.createUser(address, createdNonce);

      const foundNonce = await usersRepository.getNonce(address);

      expect(foundNonce).to.eql(createdNonce);
    });

    it("throws when there is no user for the address", async () => {
      const address = Random.address();

      const usersRepository = new UsersRepository();

      await expect(usersRepository.getNonce(address)).to.be.rejectedWith(
        "Cannot read property 'nonce' of null"
      );
    });
  });

  context("getUser", () => {
    it("returns the user when it exists", async () => {
      const address = Random.address();
      const nonce = Random.nonce();

      await new User({
        address,
        nonce,
        role: userRoles.USER,
      }).save();

      const usersRepository = new UsersRepository();

      const user = await usersRepository.getUser(address);

      expect(user.address).to.eql(address);
      expect(user.nonce).to.eql(nonce);
      expect(user.role).to.eql(userRoles.USER);
    });

    it("returns undefined when the user does not exist", async () => {
      const address = Random.address();

      const usersRepository = new UsersRepository();

      const user = await usersRepository.getUser(address);

      expect(user).to.be.null;
    });
  });

  context("setUserToAdmin", () => {
    it("sets the role of an existing user to admin", async () => {
      const address = Random.address();
      const nonce = Random.nonce();

      await new User({
        address,
        nonce,
        role: userRoles.USER,
      }).save();

      const usersRepository = new UsersRepository();
      await usersRepository.setUserToAdmin(address);

      const user = await User.findOne({ address });

      expect(user.role).to.eql(userRoles.ADMIN);
    });

    it("leaves the role of an existing admin as admin", async () => {
      const address = Random.address();
      const nonce = Random.nonce();

      await new User({
        address,
        nonce,
        role: userRoles.ADMIN,
      }).save();

      const usersRepository = new UsersRepository();
      await usersRepository.setUserToAdmin(address);

      const user = await User.findOne({ address });

      expect(user.role).to.eql(userRoles.ADMIN);
    });

    it("creates the user as an admin if they don't exist", async () => {
      const address = Random.address();

      const usersRepository = new UsersRepository();
      await usersRepository.setUserToAdmin(address);

      const user = await User.findOne({ address });

      expect(user.role).to.eql(userRoles.ADMIN);
    });
  });
});
