class ConfigurationService {
  constructor(overrides = {}) {
    this.overrides = overrides;
  }

  get databaseConnectionString() {
    return (
      this.overrides.databaseConnectionString ||
      process.env.DB_CONNECTION_STRING
    );
  }

  get tokenSecret() {
    return this.overrides.tokenSecret || process.env.TOKEN_SECRET;
  }

  get gcloudSecret() {
    return this.overrides.gcloudSecret || process.env.GCLOUD_SECRET;
  }

  get vouchersBucket() {
    return this.overrides.vouchersBucket || process.env.VOUCHERS_BUCKET;
  }
}

module.exports = ConfigurationService;
