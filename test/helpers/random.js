const faker = require("faker");
const keythereum = require("keythereum");
const ethers = require("ethers");
const mongoose = require("mongoose");

const oneDayInMillis = 24 * 60 * 60 * 1000;
const twoDaysInMillis = 2 * oneDayInMillis;

class Random {
  static documentId() {
    return new mongoose.Types.ObjectId();
  }

  static address() {
    const params = { keyBytes: 32, ivBytes: 16 };
    const keyDetails = keythereum.create(params);

    return ethers.utils.computeAddress(keyDetails.privateKey);
  }

  static nonce() {
    return faker.random.number({ min: 0, max: 1000000 });
  }

  static title() {
    return faker.random.words(3);
  }

  static description() {
    return faker.random.words(6);
  }

  static quantity() {
    return faker.random.number({ min: 0, max: 20 });
  }

  static category() {
    return faker.random.arrayElement([
      "Accessories",
      "Automobiles & Motorcycles",
      "Beauty & Health",
      "Books",
      "Clothes",
      "Electronics",
      "Furniture",
      "Home & Garden",
      "Jewelry",
      "Kids",
    ]);
  }

  static pastDateUnixMillis() {
    return (
      Date.now() -
      twoDaysInMillis -
      faker.random.number({ min: -oneDayInMillis, max: oneDayInMillis })
    );
  }

  static pastDateUnixMillisBefore(otherDateUnixMillis) {
    return (
      otherDateUnixMillis -
      twoDaysInMillis +
      faker.random.number({ min: -oneDayInMillis, max: oneDayInMillis })
    );
  }

  static pastDateUnixMillisAfter(otherDateUnixMillis) {
    const nowMillis = Date.now();
    const millisSinceOther = nowMillis - otherDateUnixMillis;
    return (
      otherDateUnixMillis +
      faker.random.number({ min: 1, max: millisSinceOther - 1 })
    );
  }

  static currentDateUnixMillis() {
    return Date.now();
  }

  static futureDateUnixMillis() {
    return (
      Date.now() +
      twoDaysInMillis +
      faker.random.number({ min: -oneDayInMillis, max: oneDayInMillis })
    );
  }

  static futureDateUnixMillisBefore(otherDateUnixMillis) {
    const nowMillis = Date.now();
    const millisUntilOther = otherDateUnixMillis - nowMillis;
    return (
      otherDateUnixMillis -
      faker.random.number({ min: 1, max: millisUntilOther - 1 })
    );
  }

  static futureDateUnixMillisAfter(otherDateUnixMillis) {
    return (
      otherDateUnixMillis +
      twoDaysInMillis +
      faker.random.number({ min: -oneDayInMillis, max: oneDayInMillis })
    );
  }

  static price() {
    return ethers.utils
      .parseEther(
        faker.random
          .float({
            min: 0.00001,
            max: 0.01,
            precision: 0.0000000000001,
          })
          .toString()
      )
      .toString();
  }

  static deposit() {
    return ethers.utils
      .parseEther(
        faker.random
          .float({
            min: 0.000001,
            max: 0.001,
            precision: 0.0000000000001,
          })
          .toString()
      )
      .toString();
  }

  static location() {
    return faker.address.city();
  }

  static contact() {
    return faker.phone.phoneNumber();
  }

  static conditions() {
    return faker.random.arrayElement(["new", "used"]);
  }

  static digit() {
    return faker.random.arrayElement([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  }

  static uint256() {
    const digits = [];
    for (var i = 0; i < 77; i++) {
      digits.push(Random.digit());
    }
    return digits.join("");
  }

  static voucherSupplyMetadata(overrides = {}) {
    return {
      title: Random.title(),
      qty: Random.quantity(),
      category: Random.category(),
      startDate: Random.currentDateUnixMillis(),
      expiryDate: Random.futureDateUnixMillis(),
      offeredDate: Random.pastDateUnixMillis(),
      price: Random.price(),
      buyerDeposit: Random.deposit(),
      sellerDeposit: Random.deposit(),
      description: Random.description(),
      location: Random.location(),
      contact: Random.contact(),
      conditions: Random.conditions(),
      _tokenIdSupply: Random.uint256(),
      ...overrides,
    };
  }

  static fileRefType() {
    return faker.random.arrayElement(["document", "image"]);
  }

  static fileRefUrl() {
    const bucketName = faker.random.alpha(10);
    const subFolderName = faker.random.alpha(10);
    const fileName = faker.random.alpha(10);

    return `https://storage.googleapis.com/${bucketName}/${subFolderName}/${fileName}`;
  }

  static fileRef(overrides = {}) {
    return {
      url: Random.fileRefUrl(),
      type: Random.fileRefType(),
      ...overrides,
    };
  }

  static voucherMetadata(overrides = {}) {
    return {
      _tokenIdSupply: Random.uint256(),
      _tokenIdVoucher: Random.uint256(),
      _holder: Random.address(),
      _issuer: Random.address(),
      ...overrides,
    };
  }
}

module.exports = Random;
