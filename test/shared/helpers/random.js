const faker = require("faker");
const keythereum = require("keythereum");
const ethers = require("ethers");
const mongoose = require("mongoose");
const keccak256 = require("keccak256");

const status = require("../../../src/utils/userVoucherStatus");
const Time = require("./time");

class Random {
  static documentId() {
    return new mongoose.Types.ObjectId();
  }

  static account() {
    const keyDetails = keythereum.create();
    const privateKey = keyDetails.privateKey;
    const address = ethers.utils.computeAddress(privateKey);

    return {
      address,
      privateKey,
    };
  }

  static address() {
    const keyDetails = keythereum.create();

    return ethers.utils.computeAddress(keyDetails.privateKey);
  }

  static transactionHash() {
    return `0x${keccak256(faker.random.alpha(64)).toString("hex")}`;
  }

  static nonce() {
    return faker.random.number({ min: 0, max: 1000000 });
  }

  static chainId() {
    return faker.random.number({ min: 1, max: 5 });
  }

  static signingDomain() {
    return {
      name: "Boson Protocol",
      version: "1",
      chainId: Random.chainId(),
      verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
    };
  }

  static tokenSecret() {
    return faker.random.hexaDecimal(128);
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
      Time.daysInMilliseconds(2) -
      faker.random.number({
        min: -Time.oneDayInMilliseconds(),
        max: Time.oneDayInMilliseconds(),
      })
    );
  }

  static pastDateUnixMillisBefore(otherDateUnixMillis) {
    return (
      otherDateUnixMillis -
      Time.daysInMilliseconds(2) +
      faker.random.number({
        min: -Time.oneDayInMilliseconds(),
        max: Time.oneDayInMilliseconds(),
      })
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
      Time.daysInMilliseconds(2) +
      faker.random.number({
        min: -Time.oneDayInMilliseconds(),
        max: Time.oneDayInMilliseconds(),
      })
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
      Time.daysInMilliseconds(2) +
      faker.random.number({
        min: -Time.oneDayInMilliseconds(),
        max: Time.oneDayInMilliseconds(),
      })
    );
  }

  static monetaryAmount(options = {}) {
    return ethers.utils
      .parseEther(
        faker.random
          .float({
            min: options.min || 0.00001,
            max: options.max || 0.01,
            precision: 0.0000000000001,
          })
          .toString()
      )
      .toString();
  }

  static price() {
    return Random.monetaryAmount({ min: 0.00001, max: 0.01 });
  }

  static deposit() {
    return Random.monetaryAmount({ min: 0.000001, max: 0.001 });
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

  static voucherAttributes(overrides = {}) {
    // Create happy path redeemed an finalized voucher by default
    const finalizeUnixMillis = Random.pastDateUnixMillis();
    const redeemUnixMillis = Random.pastDateUnixMillisBefore(
      finalizeUnixMillis
    );
    const commitUnixMillis = Random.pastDateUnixMillisBefore(redeemUnixMillis);

    // Allow voucher metadata to be passed as overrides and do the right thing
    const voucherOwner = overrides._issuer || Random.address().toLowerCase();
    delete overrides._issuer;

    return {
      supplyID: Random.documentId().toString(),
      _holder: Random.address().toLowerCase(),
      _tokenIdSupply: Random.uint256(),
      _tokenIdVoucher: Random.uint256(),
      [status.COMMITTED]: commitUnixMillis,
      [status.CANCELLED]: null,
      [status.COMPLAINED]: null,
      [status.REDEEMED]: redeemUnixMillis,
      [status.REFUNDED]: null,
      [status.FINALIZED]: finalizeUnixMillis,
      voucherOwner,
      actionDate: commitUnixMillis,
      ...overrides,
    };
  }

  static paymentType() {
    return faker.random.number({ min: 0, max: 2 });
  }

  static paymentMetadata(overrides = {}) {
    return {
      _tokenIdVoucher: Random.uint256(),
      _to: Random.address(),
      _payment: Random.monetaryAmount(),
      _type: Random.paymentType(),
      txHash: Random.transactionHash(),
      ...overrides,
    };
  }
}

module.exports = Random;