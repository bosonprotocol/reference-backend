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
  context("storeFiles", () => {
    it("adds a file reference on successful file store", async () => {
      const fieldName = "fileToUpload";

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

      const fileStore = FakeFileStore.successful();
      const fileStorageMiddleware = new FileStorageMiddleware(
          fieldName,
          fileStore
      );
      const storeFiles = Promises.promisify(
          fileStorageMiddleware.storeFiles,
          fileStorageMiddleware
      );

      await storeFiles(request, response);

      expect(request.files.length).to.eql(1);
      expect(request.fileRefs.length).to.eql(1);
      expect(request.fileRefs[0]).to.include({
        url: "https://example.com/some-voucher/valid-image.png",
      });
    });

    it("does not add a file reference on failed file store", async () => {
      const fieldName = "fileToUpload";

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

      const fileStore = FakeFileStore.failure();
      const fileStorageMiddleware = new FileStorageMiddleware(
          fieldName,
          fileStore
      );
      const storeFiles = Promises.promisify(
          fileStorageMiddleware.storeFiles,
          fileStorageMiddleware
      );

      await expect(storeFiles(request, response)).to.eventually.be.rejected;

      expect(request.files.length).to.eql(1);
      expect(request.fileRefs.length).to.eql(0);
    });
  });
});
