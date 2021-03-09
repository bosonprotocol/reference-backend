const multer = require("multer");

class FileStorageMiddleware {
  constructor(fieldName, fileStore) {
    const maximumAllowedFiles = 10;
    const storage = multer.diskStorage({});
    const uploader = multer({ storage });

    this.delegate = uploader.array(fieldName, maximumAllowedFiles);
    this.fileStore = fileStore;
  }

  async storeFiles(req, res, next) {
    this.delegate(req, res, async () => {
      if (!req.files) next();

      const fileRefs = [];

      try {
        const subFolderName = req.body.title;

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
