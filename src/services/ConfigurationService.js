const coerceUndefined = (environmentVariableValue) =>
  environmentVariableValue !== "undefined"
    ? environmentVariableValue
    : undefined;

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

  get vouchersBucket() {
    return (
      this.overrides.vouchersBucket ||
      coerceUndefined(process.env.VOUCHERS_BUCKET)
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
}

module.exports = ConfigurationService;
