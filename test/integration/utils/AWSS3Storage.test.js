const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { expect } = chai;

const fs = require("fs");
const { S3 } = require("aws-sdk");
const MockExpressRequest = require("mock-express-request");

const AWSS3Storage = require("../../../src/utils/AWSS3Storage");
const Promises = require("../../shared/helpers/Promises");
const Random = require("../../shared/helpers/Random");
const RegExps = require("../../shared/helpers/RegExps");
const Streams = require("../../shared/helpers/Streams");

describe("AWSS3Storage", function () {
  this.timeout(15 * 1000); // set longer timeout for image upload

  context("_handleFile", () => {
    const bucketName = process.env.AWS_IMAGE_UPLOAD_STORAGE_BUCKET_NAME;
    const region = process.env.AWS_REGION;
    let info, s3;

    before(async () => {
      const storage = new AWSS3Storage(bucketName);

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

      s3 = new S3();
    });

    it("includes the location in the resulting info", async () => {
      expect(info.location).to.match(
        new RegExp(`https:\\/\\/${bucketName}.s3.${region}.amazonaws.com\\/.*`)
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

    it("uploads the file to S3", async () => {
      const source = await Streams.readBinaryPromise(
        fs.createReadStream("test/fixtures/valid-image-1.png")
      );
      const object = await Streams.readBinaryPromise(
        s3
          .getObject({
            Bucket: bucketName,
            Key: info.key,
          })
          .createReadStream()
      );

      expect(object).to.eql(source);
    });

    it("allows public read of the file", async () => {
      const acl = await s3
        .getObjectAcl({
          Bucket: bucketName,
          Key: info.key,
        })
        .promise();

      expect(acl.Grants).to.deep.include({
        Grantee: {
          Type: "Group",
          URI: "http://acs.amazonaws.com/groups/global/AllUsers",
        },
        Permission: "READ",
      });
    });

    it("uses the mimetype of the file", async () => {
      const object = await s3
        .headObject({
          Bucket: bucketName,
          Key: info.key,
        })
        .promise();

      expect(object.ContentType).to.eql("image/png");
    });

    it("uses server side encryption for the file", async () => {
      const object = await s3
        .headObject({
          Bucket: bucketName,
          Key: info.key,
        })
        .promise();

      expect(object.ServerSideEncryption).to.eql("AES256");
    });
  });

  context("_removeFile", () => {
    const bucketName = process.env.AWS_IMAGE_UPLOAD_STORAGE_BUCKET_NAME;
    let key, s3;

    before(async () => {
      s3 = new S3();
      key = Random.uuid();

      await s3
        .upload({
          Bucket: bucketName,
          Key: key,
          Body: fs.createReadStream("test/fixtures/valid-image-1.png"),
          ServerSideEncryption: "AES256",
        })
        .promise();

      const storage = new AWSS3Storage(bucketName);

      const file = {
        bucket: bucketName,
        key: key,
      };
      const request = new MockExpressRequest();
      const removeFile = Promises.promisify(storage._removeFile, storage);

      await removeFile(request, file);
    });

    it("removes the file from S3", async () => {
      await expect(
        s3
          .headObject({
            Bucket: bucketName,
            Key: key,
          })
          .promise()
      ).to.eventually.be.rejected;
    });
  });

  context("_removeFiles", () => {
    const bucketName = process.env.AWS_IMAGE_UPLOAD_STORAGE_BUCKET_NAME;
    let key1, key2, s3, files;

    before(async () => {
      s3 = new S3();
      key1 = Random.uuid();
      key2 = Random.uuid();

      await s3
        .upload({
          Bucket: bucketName,
          Key: key1,
          Body: fs.createReadStream("test/fixtures/valid-image-1.png"),
          ServerSideEncryption: "AES256",
        })
        .promise();
      await s3
        .upload({
          Bucket: bucketName,
          Key: key2,
          Body: fs.createReadStream("test/fixtures/update-image.png"),
          ServerSideEncryption: "AES256",
        })
        .promise();

      const storage = new AWSS3Storage(bucketName);

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
          return expect(
            s3
              .headObject({
                Bucket: file.bucket,
                Key: file.key,
              })
              .promise()
          ).to.eventually.be.rejected;
        })
      );
    });
  });
});
