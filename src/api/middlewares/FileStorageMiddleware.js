const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const ApiError = require("../ApiError");

class FileStorageMiddleware {
  constructor(configurationService, fileValidator, fileStore) {
    const storage = multer.diskStorage({});
    const uploader = multer({ storage });

    this.delegate = uploader.array(
      configurationService.imageUploadFileFieldName,
      configurationService.imageUploadMaximumFiles
    );
    this.fileValidator = fileValidator;
    this.fileStore = fileStore;
  }

  async storeFiles(req, res, next) {
    req.fileRefs = [];

    this.delegate(req, res, async () => {
      if (!req.files) next();

      if (req.files.some((file) => !this.fileValidator.isValid(file))) {
        return next(
          new ApiError(400, "Invalid file type for voucher set image.")
        );
      }

      try {
        req.fileRefs = await Promise.all(
          req.files.map((file) =>
            this.fileStore.store({ ...file, folder: uuidv4() })
          )
        );

        next();
      } catch (err) {
        next(err);
      }
    });
  }
}

module.exports = FileStorageMiddleware;
