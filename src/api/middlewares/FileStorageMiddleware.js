const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const ApiError = require("../../api/ApiError");

class FileStorageMiddleware {
  constructor(
    fieldName,
    allowedMimeTypes,
    minimumFileSizeInKB,
    maximumFileSizeInKB,
    fileStore
  ) {
    const maximumAllowedFiles = 10;
    const storage = multer.diskStorage({});
    const uploader = multer({ storage });

    this.allowedMimeTypes = allowedMimeTypes;
    this.minimumFileSizeInKB = minimumFileSizeInKB;
    this.maximumFileSizeInKB = maximumFileSizeInKB;

    this.delegate = uploader.array(fieldName, maximumAllowedFiles);
    this.fileStore = fileStore;
  }

  validFileTypes(files) {
    for (let i = 0; i < files.length; i++) {
      const mimetype = files[i].mimetype;
      const fileSizeInKB = files[i].size / 1024;

      // Check file type
      if (!this.allowedMimeTypes.includes(mimetype)) {
        return false;
      }

      // Check minimum file limit
      if (fileSizeInKB < this.minimumFileSizeInKB) {
        return false;
      }

      // Check maximum file limit
      if (fileSizeInKB > this.maximumFileSizeInKB) {
        return false;
      }
    }
    return true;
  }

  async storeFiles(req, res, next) {
    this.delegate(req, res, async () => {
      if (!req.files) next();

      if (!this.validFileTypes(req.files)) {
        return next(
          new ApiError(400, "Invalid file type for voucher set image.")
        );
      }

      const fileRefs = [];

      try {
        const folder = uuidv4();

        for (let i = 0; i < req.files.length; i++) {
          const file = req.files[i];

          const fileRef = await this.fileStore.store({
            ...file,
            folder,
          });

          fileRefs.push(fileRef);
        }
      } catch (err) {
        next(err);
      }

      req.fileRefs = fileRefs;

      next();
    });
  }
}

module.exports = FileStorageMiddleware;
