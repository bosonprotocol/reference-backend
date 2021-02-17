const multer = require("multer");

class FileStorageMiddleware {
  constructor(fieldName) {
    const maximumAllowedFiles = 10;
    const storage = multer.diskStorage({});
    const uploader = multer({ storage })

    this.delegate = uploader.array(fieldName, maximumAllowedFiles)
  }

  storeFiles(req, res, next) {
    return this.delegate(req, res, next);
  }
}

module.exports = FileStorageMiddleware;
