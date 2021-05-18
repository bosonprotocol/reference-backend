const { v4: uuidv4 } = require("uuid");

class FakeStorage {
  static successful() {
    return new FakeStorage();
  }

  static failure() {
    return new FakeStorage("Oops!");
  }

  constructor(errorMessage = null) {
    this.errorMessage = errorMessage;
    this.files = [];
  }

  _handleFile(req, file, cb) {
    if (this.errorMessage) {
      cb(new Error(this.errorMessage));
    }

    this.files.push({
      file,
    });

    cb(null, {
      size: 51200,
      bucket: uuidv4(),
      key: uuidv4(),
      location: `https://example.com/${file.originalname}`,
      contentType: "image/png",
    });
  }

  _removeFile(req, file, cb) {
    cb();
  }

  _removeFiles(req, files, cb) {
    cb();
  }
}

module.exports = FakeStorage;
