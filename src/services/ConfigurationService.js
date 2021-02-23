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
      coerceUndefined(process.env.DB_CONNECTION_STRING)
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
}

module.exports = ConfigurationService;
