const multer = require("multer");

const ApiError = require("./../../../src/api/ApiError");

class FakeFileStorageMiddleware {
  constructor(fieldName) {
    const maximumAllowedFiles = 10;

    this.allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png"]; // TODO move to config
    this.minimumFileSizeInKB = 10;

    this.delegate = multer({}).array(fieldName, maximumAllowedFiles);
    this.files = [];
  }

  validFileTypes(files) {
    for (let i = 0; i < files.length; i++) {
      const mimetype = files[i].mimetype;
      const fileSizeInKB = files[i].size / 1000;

      // Check file type
      if (!this.allowedMimeTypes.includes(mimetype)) {
        return false;
      }

      // Check file size
      if (fileSizeInKB < this.minimumFileSizeInKB) {
        return false;
      }
    }
    return true;
  }

  async storeFiles(req, res, next) {
    this.delegate(req, res, () => {
      if (!this.validFileTypes(req.files)) {
        return next(
          new ApiError(400, "Invalid file type for voucher set image.")
        );
      }

      this.files.concat(req.files);

      req.fileRefs = (req.files || []).reduce((acc, file) => {
        return [
          ...acc,
          {
            url: `https://boson.example.com/${file.originalname}`,
            type: "image",
          },
        ];
      }, []);

      next();
    });
  }
}

module.exports = FakeFileStorageMiddleware;
