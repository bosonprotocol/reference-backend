const { expect } = require("chai");
const fs = require("fs");
const path = require("path");
const MockExpressRequest = require("mock-express-request");
const FormData = require("form-data");

const FileStorageMiddleware = require("../../../../src/api/middlewares/FileStorageMiddleware");

describe("FileStorageMiddleware", () => {
  context("storeFiles", () => {
    it("uploads the file to the configured bucket", async () => {
      const fieldName = "fileToUpload";
      const bucketName = "vouchers-upload-images-bucket";

      const formData = new FormData();
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

      let storedResolve
      const waiter = new Promise((resolve) => {
        storedResolve = resolve;
      });

      let called = null;
      const nextFn = (arg) => {
        console.log("next function was called.");
        called = arg;
        storedResolve(arg);
      };

      const fileStorageMiddleware = new FileStorageMiddleware(
        fieldName,
        bucketName,
      );

      await fileStorageMiddleware.storeFiles(
        request,
        response,
        nextFn
      );

      await waiter;

      console.log(called);

      expect(request.files.length).to.be.greaterThan(0);
    });
  });
});
