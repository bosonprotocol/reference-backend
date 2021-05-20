const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const { expect } = chai;

const fs = require("fs");
const MockExpressRequest = require("mock-express-request");
const FormData = require("form-data");

const FakeStorage = require("../../../shared/fakes/utils/FakeStorage");
const FileValidator = require("../../../../src/services/FileValidator");
const FileStorageMiddleware = require("../../../../src/api/middlewares/FileStorageMiddleware");
const Promises = require("../../../shared/helpers/Promises");
const Streams = require("../../../shared/helpers/Streams");
const RegExps = require("../../../shared/helpers/RegExps");

describe("FileStorageMiddleware", () => {
  context("storeFiles", () => {
    it("uploads the files using the provided storage", async () => {
      const fieldName = "image";

      const request = fileUploadRequest(fieldName, [
        "test/fixtures/valid-image-1.png",
        "test/fixtures/valid-image-2.jpg",
      ]);
      const response = {};

      const [file1Data] = await Streams.readBinaryPromise(
        fs.createReadStream("test/fixtures/valid-image-1.png")
      );
      const [file2Data] = await Streams.readBinaryPromise(
        fs.createReadStream("test/fixtures/valid-image-2.jpg")
      );

      const storage = FakeStorage.successful();
      const middleware = fileStorageMiddleware({
        storage,
        fieldName,
      });
      const storeFiles = Promises.promisify(middleware.storeFiles, middleware);

      await storeFiles(request, response);

      const files = storage.handleFileCalls;
      expect(files.length).to.eql(2);

      const file1 = files[0].file;
      expect(file1.data).to.eql(file1Data);
      expect(file1.size).to.eql(file1Data.length);
      expect(file1.bucket).to.match(RegExps.uuidV4);
      expect(file1.key).to.match(RegExps.uuidV4);
      expect(file1.location).to.eql("https://example.com/valid-image-1.png");
      expect(file1.contentType).to.eql("image/png");

      const file2 = files[1].file;
      expect(file2.data).to.eql(file2Data);
      expect(file2.size).to.eql(file2Data.length);
      expect(file2.bucket).to.match(RegExps.uuidV4);
      expect(file2.key).to.match(RegExps.uuidV4);
      expect(file2.location).to.eql("https://example.com/valid-image-2.jpg");
      expect(file2.contentType).to.eql("image/jpeg");
    });

    it("adds the files to the request", async () => {
      const fieldName = "image";

      const request = fileUploadRequest(fieldName, [
        "test/fixtures/valid-image-1.png",
        "test/fixtures/valid-image-2.jpg",
      ]);
      const response = {};

      const [file1Data] = await Streams.readBinaryPromise(
        fs.createReadStream("test/fixtures/valid-image-1.png")
      );
      const [file2Data] = await Streams.readBinaryPromise(
        fs.createReadStream("test/fixtures/valid-image-2.jpg")
      );

      const storage = FakeStorage.successful();
      const middleware = fileStorageMiddleware({
        storage,
        fieldName,
      });
      const storeFiles = Promises.promisify(middleware.storeFiles, middleware);

      await storeFiles(request, response);

      const files = request.files;
      expect(files.length).to.eql(2);

      const file1 = files[0];
      expect(file1.size).to.eql(file1Data.length);
      expect(file1.bucket).to.match(RegExps.uuidV4);
      expect(file1.key).to.match(RegExps.uuidV4);
      expect(file1.location).to.eql("https://example.com/valid-image-1.png");
      expect(file1.contentType).to.eql("image/png");

      const file2 = files[1];
      expect(file2.size).to.eql(file2Data.length);
      expect(file2.bucket).to.match(RegExps.uuidV4);
      expect(file2.key).to.match(RegExps.uuidV4);
      expect(file2.location).to.eql("https://example.com/valid-image-2.jpg");
      expect(file2.contentType).to.eql("image/jpeg");
    });

    it("adds an empty array to the request when no files are present", async () => {
      const fieldName = "image";

      const request = fileUploadRequest(fieldName, []);
      const response = {};

      const storage = FakeStorage.successful();
      const middleware = fileStorageMiddleware({
        storage,
        fieldName,
      });
      const storeFiles = Promises.promisify(middleware.storeFiles, middleware);

      await storeFiles(request, response);

      expect(request.files).to.eql([]);
    });

    it("limits the allowed files to the provided maximum", async () => {
      const fieldName = "image";

      const request = fileUploadRequest(fieldName, [
        "test/fixtures/valid-image-1.png",
        "test/fixtures/valid-image-2.jpg",
      ]);
      const response = {};

      const [file1Data] = await Streams.readBinaryPromise(
        fs.createReadStream("test/fixtures/valid-image-1.png")
      );

      const storage = FakeStorage.successful();
      const middleware = fileStorageMiddleware({
        storage,
        fieldName,
        maximumFiles: 1,
      });
      const storeFiles = Promises.promisify(middleware.storeFiles, middleware);

      await storeFiles(request, response);

      expect(request.files.length).to.eql(1);

      const file1 = request.files[0];
      expect(file1.size).to.eql(file1Data.length);
      expect(file1.bucket).to.match(RegExps.uuidV4);
      expect(file1.key).to.match(RegExps.uuidV4);
      expect(file1.location).to.eql("https://example.com/valid-image-1.png");
      expect(file1.contentType).to.eql("image/png");
    });

    it("removes all files when one file is too large", async () => {
      const fieldName = "image";

      const request = fileUploadRequest(fieldName, [
        "test/fixtures/valid-image-1.png",
        "test/fixtures/greater-than-5MB.jpg",
      ]);
      const response = {};

      const storage = FakeStorage.successful();
      const middleware = fileStorageMiddleware({
        storage,
        fieldName,
      });
      const storeFiles = Promises.promisify(middleware.storeFiles, middleware);

      await expect(storeFiles(request, response)).to.eventually.be.rejectedWith(
        "Invalid file."
      );

      const removeFilesCall = storage.removeFilesCalls[0];
      const removedFiles = removeFilesCall.files;

      expect(removedFiles.length).to.eql(2);
      expect(removedFiles[0].originalname).to.eql("valid-image-1.png");
      expect(removedFiles[0]).to.include.keys(["bucket", "key"]);
      expect(removedFiles[1].originalname).to.eql("greater-than-5MB.jpg");
      expect(removedFiles[1]).to.include.keys(["bucket", "key"]);

      expect(request.files).to.eql([]);
    });

    it("removes all files when one file is too small", async () => {
      const fieldName = "image";

      const request = fileUploadRequest(fieldName, [
        "test/fixtures/valid-image-1.png",
        "test/fixtures/less-than-10KB.png",
      ]);
      const response = {};

      const storage = FakeStorage.successful();
      const middleware = fileStorageMiddleware({
        storage,
        fieldName,
      });
      const storeFiles = Promises.promisify(middleware.storeFiles, middleware);

      await expect(storeFiles(request, response)).to.eventually.be.rejectedWith(
        "Invalid file."
      );

      const removeFilesCall = storage.removeFilesCalls[0];
      const removedFiles = removeFilesCall.files;

      expect(removedFiles.length).to.eql(2);
      expect(removedFiles[0].originalname).to.eql("valid-image-1.png");
      expect(removedFiles[0]).to.include.keys(["bucket", "key"]);
      expect(removedFiles[1].originalname).to.eql("less-than-10KB.png");
      expect(removedFiles[1]).to.include.keys(["bucket", "key"]);

      expect(request.files).to.eql([]);
    });

    it("removes all files when one file has an unsupported mime type", async () => {
      const fieldName = "image";

      const request = fileUploadRequest(fieldName, [
        "test/fixtures/valid-image-1.png",
        "test/fixtures/malicious-fake-image.html",
      ]);
      const response = {};

      const storage = FakeStorage.successful();
      const middleware = fileStorageMiddleware({
        storage,
        fieldName,
      });
      const storeFiles = Promises.promisify(middleware.storeFiles, middleware);

      await expect(storeFiles(request, response)).to.eventually.be.rejectedWith(
        "Invalid file."
      );

      const removeFilesCall = storage.removeFilesCalls[0];
      const removedFiles = removeFilesCall.files;

      expect(removedFiles.length).to.eql(2);
      expect(removedFiles[0].originalname).to.eql("valid-image-1.png");
      expect(removedFiles[0]).to.include.keys(["bucket", "key"]);
      expect(removedFiles[1].originalname).to.eql("malicious-fake-image.html");
      expect(removedFiles[1]).to.include.keys(["bucket", "key"]);

      expect(request.files).to.eql([]);
    });
  });
});

const fileUploadRequest = (fieldName, paths) => {
  const formData = new FormData();
  formData.append("title", "some-voucher");

  paths.forEach((path) => {
    formData.append(fieldName, fs.createReadStream(path));
  });

  const request = new MockExpressRequest({
    method: "POST",
    host: "localhost",
    url: "/voucher-sets",
    headers: formData.getHeaders(),
  });

  formData.pipe(request);

  return request;
};

const fileValidator = ({
  allowedMimeTypes = ["image/png", "image/jpeg"],
  minimumFileSizeInKB = 10,
  maximumFileSizeInKB = 5120,
}) => {
  return new FileValidator(
    allowedMimeTypes,
    minimumFileSizeInKB,
    maximumFileSizeInKB
  );
};

const fileStorageMiddleware = ({
  storage,
  fieldName,
  allowedMimeTypes = ["image/png", "image/jpeg"],
  maximumFiles = 5,
  minimumFileSizeInKB = 10,
  maximumFileSizeInKB = 5120,
}) => {
  return new FileStorageMiddleware(
    fieldName,
    maximumFiles,
    fileValidator({
      allowedMimeTypes,
      minimumFileSizeInKB,
      maximumFileSizeInKB,
    }),
    storage
  );
};
