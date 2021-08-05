const coerceArray = (value) => value && value.split(",");

const coerceNumber = (value) => value && Number(value);

const coerceUndefined = (environmentVariableValue) =>
  environmentVariableValue !== "undefined"
    ? environmentVariableValue
    : undefined;

const TEN_KILOBYTES_IN_KILOBYTES = 10;
const FIVE_MEGABYTES_IN_KILOBYTES = 5 * 1024;

class ConfigurationService {
  constructor(overrides = {}) {
    this.overrides = overrides;
  }

  get databaseConnectionString() {
    return (
      this.overrides.databaseConnectionString ||
      coerceUndefined(process.env.DB_CONNECTION_STRING) ||
      "mongodb://localhost:27017"
    );
  }

  get databaseName() {
    return (
      this.overrides.databaseName ||
      coerceUndefined(process.env.DB_NAME) ||
      "api"
    );
  }

  get databaseUsername() {
    return (
      this.overrides.databaseUsername ||
      coerceUndefined(process.env.DB_USERNAME) ||
      "admin"
    );
  }

  get databasePassword() {
    return (
      this.overrides.databasePassword ||
      coerceUndefined(process.env.DB_PASSWORD) ||
      "secret"
    );
  }

  get tokenSecret() {
    return (
      this.overrides.tokenSecret || coerceUndefined(process.env.TOKEN_SECRET)
    );
  }

  get gcloudSecret() {
    return (
      this.overrides.gcloudSecret || coerceUndefined(process.env.GCLOUD_SECRET)
    );
  }

  get imageUploadFileFieldName() {
    return (
      this.overrides.imageUploadFileFieldName ||
      coerceUndefined(process.env.IMAGE_UPLOAD_FILE_FIELD_NAME) ||
      "fileToUpload"
    );
  }

  get imageUploadStorageEngine() {
    return (
      this.overrides.imageUploadStorageEngine ||
      coerceUndefined(process.env.IMAGE_UPLOAD_STORAGE_ENGINE) ||
      "AWS"
    );
  }

  get imageUploadStorageBucketName() {
    return (
      this.overrides.imageUploadStorageBucketName ||
      coerceUndefined(process.env.IMAGE_UPLOAD_STORAGE_BUCKET_NAME) ||
      coerceUndefined(process.env.VOUCHERS_BUCKET)
    );
  }

  get imageUploadSupportedMimeTypes() {
    return (
      this.overrides.imageUploadSupportedMimeTypes ||
      coerceArray(
        coerceUndefined(process.env.IMAGE_UPLOAD_SUPPORTED_MIME_TYPES)
      ) || ["image/jpeg", "image/png"]
    );
  }

  get imageUploadMinimumFileSizeInKB() {
    return (
      this.overrides.imageUploadMinimumFileSizeInKB ||
      coerceNumber(
        coerceUndefined(process.env.IMAGE_UPLOAD_MINIMUM_FILE_SIZE_IN_KB)
      ) ||
      TEN_KILOBYTES_IN_KILOBYTES
    );
  }

  get imageUploadMaximumFileSizeInKB() {
    return (
      this.overrides.imageUploadMaximumFileSizeInKB ||
      coerceNumber(
        coerceUndefined(process.env.IMAGE_UPLOAD_MAXIMUM_FILE_SIZE_IN_KB)
      ) ||
      FIVE_MEGABYTES_IN_KILOBYTES
    );
  }

  get imageUploadMaximumFiles() {
    return (
      this.overrides.imageUploadMaximumFiles ||
      coerceNumber(coerceUndefined(process.env.IMAGE_UPLOAD_MAXIMUM_FILES)) ||
      10
    );
  }

  get superadminUsername() {
    return (
      this.overrides.superadminUsername ||
      coerceUndefined(process.env.SUPERADMIN_USERNAME)
    );
  }

  get superadminPassword() {
    return (
      this.overrides.superadminPassword ||
      coerceUndefined(process.env.SUPERADMIN_PASSWORD)
    );
  }

  get slackToken() {
    return (
      this.overrides.slackToken || coerceUndefined(process.env.SLACK_TOKEN)
    );
  }

  get slackChannel() {
    return (
      this.overrides.slackChannel || coerceUndefined(process.env.SLACK_CHANNEL)
    );
  }
}

module.exports = ConfigurationService;
