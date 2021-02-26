const multer = require("multer");
const { Storage } = require("@google-cloud/storage");

class FileStorageMiddleware {
  constructor(fieldName, bucketName) {
    const maximumAllowedFiles = 10;
    const storage = multer.diskStorage({});
    const uploader = multer({ storage });

    this.bucketName = bucketName;
    this.delegate = uploader.array(fieldName, maximumAllowedFiles);
  }

  async storeFiles(req, res, next) {
    this.delegate(req, res, async () => {
      if (!req.files) return [];

      const PDF_CONTENT_TYPE = "application/pdf";
      const gcs = new Storage();
      const bucketName = this.bucketName;
      const bucket = gcs.bucket(bucketName);
      const subFolderName = req.body.title;
      const fileRefs = [];

      for (let i = 0; i < req.files.length; i++) {
        const fileName = req.files[i].originalname;
        const storageDestination = `${subFolderName}/${fileName}`;

        await bucket.upload(req.files[i].path, {
          destination: storageDestination,
          contentType: req.files[i].mimetype,
          resumable: false,
        });

        // Public link format - https://storage.googleapis.com/[BUCKET_NAME]/[OBJECT_NAME]
        await bucket.file(storageDestination).makePublic();

        fileRefs.push({
          url: `https://storage.googleapis.com/${bucketName}/${storageDestination}`,
          type:
            req.files[i].mimetype === PDF_CONTENT_TYPE ? "document" : "image",
        });
      }

      req.fileRefs = fileRefs;

    });

    next();

  }
}

module.exports = FileStorageMiddleware;
