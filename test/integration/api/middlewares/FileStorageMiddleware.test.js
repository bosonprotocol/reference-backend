const chai = require("chai");
const { expect } = chai;
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const fs = require("fs");
const path = require("path");
const MockExpressRequest = require("mock-express-request");
const FormData = require("form-data");

const FileStorageMiddleware = require("../../../../src/api/middlewares/FileStorageMiddleware");

const promisify = (fn, target) => {
  return function () {
    return new Promise((resolve, reject) => {
      fn.apply(target, [
        ...arguments,
        (err) => {
          if (err) {
            reject(err);
          }
          resolve();
        },
      ]);
    });
  };
};

class FakeFileStore {
  static successful() {
    return new FakeFileStore();
  }

  static failure() {
    return new FakeFileStore("Oops!");
  }

  constructor(errorMessage = null) {
    this.errorMessage = errorMessage;
    this.files = [];
  }

  async store(file, location) {
    if (this.errorMessage) {
      throw new Error(this.errorMessage);
    }

    this.files.push({
      file,
      location,
    });

    return {
      url: `https://example.com/${location}`,
      type: "image",
    };
  }
}

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
      const storeFiles = promisify(
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
      const storeFiles = promisify(
        fileStorageMiddleware.storeFiles,
        fileStorageMiddleware
      );

      await expect(storeFiles(request, response)).to.eventually.be.rejected;

      expect(request.files.length).to.eql(1);
      expect(request.fileRefs.length).to.eql(0);
    });
  });
});
