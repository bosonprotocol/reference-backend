const Streams = require("../../helpers/Streams");
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
    this.handleFileCalls = [];
    this.removeFileCalls = [];
    this.removeFilesCalls = [];
  }

  _handleFile(req, file, cb) {
    Streams.readBinary(file.stream, (err, data) => {
      if (this.errorMessage) {
        cb(new Error(this.errorMessage));
      }

      const info = {
        size: data.length,
        bucket: uuidv4(),
        key: uuidv4(),
        location: `https://example.com/${file.originalname}`,
        contentType: file.mimetype,
      };

      this.handleFileCalls.push({
        file: {
          ...file,
          ...info,
          data,
        },
      });

      cb(null, info);
    });
  }

  _removeFile(req, file, cb) {
    if (this.errorMessage) {
      cb(new Error(this.errorMessage));
    }

    this.removeFileCalls.push({
      file,
    });

    cb(null);
  }

  _removeFiles(req, files, cb) {
    if (this.errorMessage) {
      cb(new Error(this.errorMessage));
    }

    this.removeFilesCalls.push({
      files,
    });

    cb(null);
  }
}

module.exports = FakeStorage;
