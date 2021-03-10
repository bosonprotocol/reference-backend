const { Storage } = require("@google-cloud/storage");

const PDF_CONTENT_TYPE = "application/pdf";

class FileStore {
  constructor(bucketName) {
    this.storageBucket = new Storage().bucket(bucketName);
  }

  async store(file, location) {
    await this.storageBucket.upload(file.path, {
      destination: location,
      contentType: file.mimetype,
      resumable: false,
    });

    await this.storageBucket.file(location).makePublic();

    return {
      url: `https://storage.googleapis.com/${this.storageBucket.name}/${location}`,
      type: file.mimetype === PDF_CONTENT_TYPE ? "document" : "image",
    };
  }
}

module.exports = FileStore;
