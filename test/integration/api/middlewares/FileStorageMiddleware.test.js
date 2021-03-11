const chai = require("chai");
const { expect } = chai;
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const fs = require("fs");
const path = require("path");
const MockExpressRequest = require("mock-express-request");
const FormData = require("form-data");

const FakeFileStore = require("../../../shared/fakes/services/FakeFileStore");
const FileStorageMiddleware = require("../../../../src/api/middlewares/FileStorageMiddleware");
const Promises = require("../../../shared/helpers/Promises");

describe("FileStorageMiddleware", () => {
  context("storeFilesInGCloud", () => {

  });
});
