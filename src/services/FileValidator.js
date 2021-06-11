class FileValidator {
  constructor(allowedMimeTypes, minimumFileSizeInKB, maximumFileSizeInKB) {
    this.allowedMimeTypes = allowedMimeTypes;
    this.minimumFileSizeInKB = minimumFileSizeInKB;
    this.maximumFileSizeInKB = maximumFileSizeInKB;
  }

  isValid(file) {
    return (
      this.allowedMimeType(file) &&
      this.notTooSmall(file) &&
      this.notTooBig(file)
    );
  }

  fileSizeInKB(file) {
    return file.size / 1024;
  }

  allowedMimeType(file) {
    return this.allowedMimeTypes.includes(file.mimetype);
  }

  notTooSmall(file) {
    return this.fileSizeInKB(file) > this.minimumFileSizeInKB;
  }

  notTooBig(file) {
    return this.fileSizeInKB(file) < this.maximumFileSizeInKB;
  }
}

module.exports = FileValidator;
