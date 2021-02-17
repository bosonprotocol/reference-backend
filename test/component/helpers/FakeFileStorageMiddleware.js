const multer = require("multer");

class FakeFileStorageMiddleware {
  constructor(fieldName) {
    const maximumAllowedFiles = 10;

    this.delegate = multer({}).array(fieldName, maximumAllowedFiles);
    this.files = [];
  }

  async storeFiles(req, res, next) {
    this.delegate(req, res, next);

    this.files.concat(req.files);

    req.fileRefs = (req.files || []).reduce((acc, file) => {
      return [
        ...acc,
        {
          url: `https://boson.example.com/${file.filename}`,
          type: "image",
        },
      ];
    }, []);

    next();
  }
}

module.exports = FakeFileStorageMiddleware;
