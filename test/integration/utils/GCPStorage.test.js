const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { expect } = chai;

const fs = require("fs");
const { Storage } = require("@google-cloud/storage");
const MockExpressRequest = require("mock-express-request");

const GCPStorage = require("../../../src/utils/GCPStorage");
const Promises = require("../../shared/helpers/Promises");
const Random = require("../../shared/helpers/Random");
const RegExps = require("../../shared/helpers/RegExps");
const Streams = require("../../shared/helpers/Streams");

describe("GCPStorage", function () {
  this.timeout(15 * 1000); // set longer timeout for image upload

  context("_handleFile", () => {
    const bucketName = process.env.GCP_IMAGE_UPLOAD_STORAGE_BUCKET_NAME;
    let info, gcpStorage;

    before(async () => {
      const storage = new GCPStorage(bucketName);

      const file = {
        fieldname: "whatever",
        originalname: "valid-image-1.png",
        encoding: "7bit",
        mimetype: "image/png",
        stream: fs.createReadStream("test/fixtures/valid-image-1.png"),
      };
      const request = new MockExpressRequest();
      const handleFile = Promises.promisify(storage._handleFile, storage);
      const result = await handleFile(request, file);

      info = result[0];

      gcpStorage = new Storage();
    });

    it("includes the location in the resulting info", async () => {
      expect(info.location).to.match(
        new RegExp(`https:\\/\\/${bucketName}.storage.googleapis.com\\/.*`)
      );
    });

    it("includes the bucket in the resulting info", async () => {
      expect(info.bucket).to.eql(bucketName);
    });

    it("includes the key in the resulting info", async () => {
      expect(info.key).to.match(RegExps.uuidV4);
    });

    it("includes the size in the resulting info", async () => {
      expect(info.size).to.eql(2236328);
    });

    it("includes the content type in the resulting info", async () => {
      expect(info.contentType).to.eql("image/png");
    });

    it("uploads the file to Google Cloud Storage", async () => {
      const source = await Streams.readBinaryPromise(
        fs.createReadStream("test/fixtures/valid-image-1.png")
      );
      const object = await Streams.readBinaryPromise(
        gcpStorage.bucket(bucketName).file(info.key).createReadStream()
      );

      expect(object).to.eql(source);
    });

    it("allows public read of the file", async () => {
      const [isPublic] = await gcpStorage
        .bucket(bucketName)
        .file(info.key)
        .isPublic();

      expect(isPublic).to.eql(true);
    });

    it("uses the mimetype of the file", async () => {
      const [metadata] = await gcpStorage
        .bucket(bucketName)
        .file(info.key)
        .getMetadata();

      expect(metadata.contentType).to.eql("image/png");
    });
  });

  context("_removeFile", () => {
    const bucketName = process.env.GCP_IMAGE_UPLOAD_STORAGE_BUCKET_NAME;
    let key, gcpStorage;

    before(async () => {
      gcpStorage = new Storage();
      key = Random.uuid();

      await gcpStorage
        .bucket(bucketName)
        .file(key)
        .save(fs.readFileSync("test/fixtures/valid-image-1.png"), {
          predefinedAcl: "publicread",
          metadata: {
            contentType: "image/png",
          },
        });

      const storage = new GCPStorage(bucketName);

      const file = {
        bucket: bucketName,
        key: key,
      };
      const request = new MockExpressRequest();
      const removeFile = Promises.promisify(storage._removeFile, storage);

      await removeFile(request, file);
    });

    it("removes the file from Google Cloud Storage", async () => {
      await expect(gcpStorage.bucket(bucketName).file(key).get()).to.eventually
        .be.rejected;
    });
  });

  context("_removeFiles", () => {
    const bucketName = process.env.GCP_IMAGE_UPLOAD_STORAGE_BUCKET_NAME;
    let key1, key2, gcpStorage, files;

    before(async () => {
      gcpStorage = new Storage();
      key1 = Random.uuid();
      key2 = Random.uuid();

      await gcpStorage
        .bucket(bucketName)
        .file(key1)
        .save(fs.readFileSync("test/fixtures/valid-image-1.png"), {
          predefinedAcl: "publicread",
          metadata: {
            contentType: "image/png",
          },
        });
      await gcpStorage
        .bucket(bucketName)
        .file(key2)
        .save(fs.readFileSync("test/fixtures/update-image.png"), {
          predefinedAcl: "publicread",
          metadata: {
            contentType: "image/png",
          },
        });

      const storage = new GCPStorage(bucketName);

      files = [
        {
          bucket: bucketName,
          key: key1,
        },
        {
          bucket: bucketName,
          key: key2,
        },
      ];
      const request = new MockExpressRequest();
      const removeFiles = Promises.promisify(storage._removeFiles, storage);

      await removeFiles(request, files);
    });

    it("removes all files from S3", async () => {
      await Promise.all(
        files.map((file) => {
          return expect(gcpStorage.bucket(bucketName).file(file.key).get()).to
            .eventually.be.rejected;
        })
      );
    });
  });
});
