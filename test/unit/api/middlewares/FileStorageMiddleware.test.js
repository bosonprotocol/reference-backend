const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const { expect } = chai;

const fs = require("fs");
const path = require("path");
const MockExpressRequest = require("mock-express-request");
const FormData = require("form-data");

const FakeStorage = require("../../../shared/fakes/utils/FakeStorage");
const FileValidator = require("../../../../src/services/FileValidator");
const FileStorageMiddleware = require("../../../../src/api/middlewares/FileStorageMiddleware");
const Promises = require("../../../shared/helpers/Promises");
const RegExps = require("../../../shared/helpers/RegExps");

describe("FileStorageMiddleware", () => {
  context("storeFiles", () => {
    it("adds a file reference on successful file store", async () => {
      const fieldName = "image";
      const allowedMimeTypes = ["image/png"];
      const maximumFiles = 5;
      const minimumFileSizeInKB = 10;
      const maximumFileSizeInKB = 5 * 1024;

      const formData = new FormData();
      formData.append("title", "some-voucher");
      formData.append(
        fieldName,
        fs.createReadStream(
          path.join(__dirname, "..", "..", "..", "fixtures", "valid-image.png")
        )
      );
      const request = new MockExpressRequest({
        method: "POST",
        host: "localhost",
        url: "/voucher-sets",
        headers: formData.getHeaders(),
      });
      formData.pipe(request);

      const response = {};

      const storage = FakeStorage.successful();
      const validator = new FileValidator(
        allowedMimeTypes,
        minimumFileSizeInKB,
        maximumFileSizeInKB
      );
      const fileStorageMiddleware = new FileStorageMiddleware(
        fieldName,
        maximumFiles,
        validator,
        storage
      );
      const storeFiles = Promises.promisify(
        fileStorageMiddleware.storeFiles,
        fileStorageMiddleware
      );

      console.log(await storeFiles(request, response));
      const imagePathRegEx = new RegExp(
        `https://example.com/${RegExps.uuidV4Pattern}/valid-image\\.png`
      );

      expect(request.files.length).to.eql(1);
      expect(request.files[0].location).to.match(imagePathRegEx);
    });

    it("does not add a file reference on failed file store", async () => {
      const fieldName = "image";
      const allowedMimeTypes = ["image/png"];
      const maximumFiles = 5;
      const minimumFileSizeInKB = 10;
      const maximumFileSizeInKB = 5 * 1024;

      const formData = new FormData();
      formData.append("title", "some-voucher");
      formData.append(
        fieldName,
        fs.createReadStream(
          path.join(__dirname, "..", "..", "..", "fixtures", "valid-image.png")
        )
      );
      const request = new MockExpressRequest({
        method: "POST",
        host: "localhost",
        url: "/voucher-sets",
        headers: formData.getHeaders(),
      });
      formData.pipe(request);

      const response = {};

      const storage = FakeStorage.failure();
      const validator = new FileValidator(
        allowedMimeTypes,
        minimumFileSizeInKB,
        maximumFileSizeInKB
      );
      const fileStorageMiddleware = new FileStorageMiddleware(
        fieldName,
        maximumFiles,
        validator,
        storage
      );

      const storeFiles = Promises.promisify(
        fileStorageMiddleware.storeFiles,
        fileStorageMiddleware
      );

      await expect(storeFiles(request, response)).to.eventually.be.rejected;

      expect(request.files.length).to.eql(1);
    });
  });
});
