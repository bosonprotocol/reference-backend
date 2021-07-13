const { Storage } = require("@google-cloud/storage");
const { v4: uuidv4 } = require("uuid");

class GCPStorage {
  constructor(bucketName) {
    this.bucket = new Storage().bucket(bucketName);
  }

  _handleFile(req, file, cb) {
    const key = uuidv4();
    const blob = this.bucket.file(key);
    const stream = blob.createWriteStream({
      predefinedAcl: "publicread",
      metadata: {
        contentType: file.mimetype,
      },
    });
    file.stream
      .pipe(stream)
      .on("error", (err) => cb(err))
      .on("finish", () => {
        cb(null, {
          size: blob.metadata.size,
          bucket: blob.metadata.bucket,
          key: key,
          contentType: blob.metadata.contentType,
          location: `https://${blob.metadata.bucket}.storage.googleapis.com/${key}`,
        });
      });
  }

  _removeFile(_, file, cb) {
    this.bucket.file(file.key).delete(cb);
  }

  _removeFiles(req, files, cb) {
    if (files.length > 0) {
      this._removeFile(req, files[0], () => {
        this._removeFiles(req, files.slice(1), cb);
      });
    } else {
      cb();
    }
  }
}

module.exports = GCPStorage;
