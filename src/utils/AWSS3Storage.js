const multerS3 = require("multer-s3");
const { S3 } = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

class AWSS3Storage {
  constructor(bucketName) {
    this.storage = multerS3({
      s3: new S3(),
      bucket: bucketName,
      acl: "public-read",
      serverSideEncryption: "AES256",
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: (_1, _2, cb) => cb(null, uuidv4()),
    });
  }

  _handleFile(req, file, cb) {
    return this.storage._handleFile(req, file, cb);
  }

  _removeFile(req, file, cb) {
    return this.storage._removeFile(req, file, cb);
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

module.exports = AWSS3Storage;
