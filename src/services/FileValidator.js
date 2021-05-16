class FileValidator {
  constructor(configurationService) {
    this.allowedMimeTypes = configurationService.imageUploadSupportedMimeTypes;
    this.minimumFileSizeInKB =
      configurationService.imageUploadMinimumFileSizeInKB;
    this.maximumFileSizeInKB =
      configurationService.imageUploadMaximumFileSizeInKB;
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
