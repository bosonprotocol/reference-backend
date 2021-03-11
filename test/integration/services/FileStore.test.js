const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { expect } = chai;

const ConfigurationService = require("../../../src/services/ConfigurationService");
const FileStore = require("../../../src/services/FileStore");
const Random = require("../../shared/helpers/Random");

const { Storage } = require("@google-cloud/storage");

describe("FileStore", () => {
  context("store()", () => {
    it("uploads the file in google cloud storage using the specified location", async () => {
      const configurationService = new ConfigurationService();
      const bucketName = configurationService.vouchersBucket;
      const bucket = new Storage().bucket(bucketName);

      const folder = Random.uuid();
      const fileName = "valid-image.png";
      const path = `test/fixtures/${fileName}`;
      const mimeType = "image/png";

      const file = Random.file({
        fileName,
        path,
        mimeType,
        folder,
      });

      const fileStore = new FileStore(bucketName);

      const result = await fileStore.store(file);

      expect(result.url).to.eql(
        `https://storage.googleapis.com/${bucketName}/${folder}/${fileName}`
      );
      expect(result.type).to.eql("image");

      const foundFiles = (await bucket.getFiles({ prefix: folder }))[0];

      expect(foundFiles.length).to.eql(1);

      const foundFile = foundFiles[0];

      expect(foundFile.name).to.eql(`${folder}/${fileName}`);
      expect(foundFile.metadata.contentType).to.eql(mimeType);
    });
  });
});
