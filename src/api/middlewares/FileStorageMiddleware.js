const multer = require("multer");

const ApiError = require("../../api/ApiError");
const { v4: uuidv4 } = require("uuid");

class FileStorageMiddleware {
  constructor(fieldName, fileStore) {
    const maximumAllowedFiles = 10;
    const storage = multer.diskStorage({});
    const uploader = multer({ storage });

    this.allowedMimeTypes = ["image/jpeg", "image/png"]; // TODO move to config
    this.minimumFileSizeInKB = 10; // TODO move to config
    this.maximumFileSizeInKB = 5 * 1024; // TODO move to config

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
        const subFolderName = uuidv4();

        for (let i = 0; i < req.files.length; i++) {
          const file = req.files[i];
          const fileName = file.originalname;
          const storageDestination = `${subFolderName}/${fileName}`;

          const fileRef = await this.fileStore.store(file, storageDestination);

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
