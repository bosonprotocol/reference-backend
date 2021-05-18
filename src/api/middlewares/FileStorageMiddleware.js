const multer = require("multer");

const ApiError = require("../ApiError");

class FileStorageMiddleware {
  constructor(fieldName, limit, validator, storage) {
    this.storage = storage;
    this.delegate = multer({ storage }).array(fieldName, limit);
    this.validator = validator;
  }

  async storeFiles(req, res, next) {
    this.delegate(req, res, () => {
      console.log("==========================");

      req.files = req.files || [];

      if (req.files.some((file) => !this.validator.isValid(file))) {
        return this.storage._removeFiles(req, req.files, () => {
          return next(new ApiError(400, "Invalid file."));
        });
      }

      next();
    });
  }
}

module.exports = FileStorageMiddleware;
