const { expect } = require("chai");

const ConfigurationService = require("../../../src/services/ConfigurationService");

const withEnv = (name, value, fn) => {
  const before = process.env[name];
  process.env[name] = value;
  fn();
  process.env[name] = before;
};

describe("ConfigurationService", () => {
  context("for database connection string", () => {
    it("uses environment variable when present", () => {
      withEnv("DB_CONNECTION_STRING", "mongodb://localhost:27017/api", () => {
        const configurationService = new ConfigurationService();
        expect(configurationService.databaseConnectionString).to.eql(
          "mongodb://localhost:27017/api"
        );
      });
    });

    it("uses the provided override when supplied", () => {
      withEnv("DB_CONNECTION_STRING", "mongodb://localhost:27017/api", () => {
        const configurationService = new ConfigurationService({
          databaseConnectionString: "mongodb://mongo.example.com:27017/api",
        });
        expect(configurationService.databaseConnectionString).to.eql(
          "mongodb://mongo.example.com:27017/api"
        );
      });
    });

    it("returns undefined when no environment variable or override", () => {
      const configurationService = new ConfigurationService();

      expect(configurationService.databaseConnectionString).to.be.undefined;
    });
  });

  context("for token secret", () => {
    it("uses environment variable by default", () => {
      withEnv("TOKEN_SECRET", "abcd123", () => {
        const configurationService = new ConfigurationService();
        expect(configurationService.tokenSecret).to.eql("abcd123");
      });
    });

    it("uses the provided override when supplied", () => {
      withEnv("TOKEN_SECRET", "abcd123", () => {
        const configurationService = new ConfigurationService({
          tokenSecret: "efgh456",
        });
        expect(configurationService.tokenSecret).to.eql("efgh456");
      });
    });

    it("returns undefined when no environment variable or override", () => {
      const configurationService = new ConfigurationService();

      expect(configurationService.tokenSecret).to.be.undefined;
    });
  });

  context("for gcloud secret", () => {
    it("uses environment variable by default", () => {
      withEnv("GCLOUD_SECRET", "abcd123", () => {
        const configurationService = new ConfigurationService();
        expect(configurationService.gcloudSecret).to.eql("abcd123");
      });
    });

    it("uses the provided override when supplied", () => {
      withEnv("GCLOUD_SECRET", "abcd123", () => {
        const configurationService = new ConfigurationService({
          gcloudSecret: "efgh456",
        });
        expect(configurationService.gcloudSecret).to.eql("efgh456");
      });
    });

    it("returns undefined when no environment variable or override", () => {
      const configurationService = new ConfigurationService();

      expect(configurationService.gcloudSecret).to.be.undefined;
    });
  });

  context("for vouchers bucket", () => {
    it("uses environment variable by default", () => {
      withEnv("VOUCHERS_BUCKET", "some-bucket", () => {
        const configurationService = new ConfigurationService();
        expect(configurationService.vouchersBucket).to.eql("some-bucket");
      });
    });

    it("uses the provided override when supplied", () => {
      withEnv("VOUCHERS_BUCKET", "some-bucket", () => {
        const configurationService = new ConfigurationService({
          vouchersBucket: "some-other-bucket",
        });
        expect(configurationService.vouchersBucket).to.eql("some-other-bucket");
      });
    });

    it("returns undefined when no environment variable or override", () => {
      const configurationService = new ConfigurationService();

      expect(configurationService.vouchersBucket).to.be.undefined;
    });
  });

  context("for superadmin username", () => {
    it("uses environment variable by default", () => {
      withEnv("SUPERADMIN_USERNAME", "supremeadmin", () => {
        const configurationService = new ConfigurationService();
        expect(configurationService.superadminUsername)
          .to.eql("supremeadmin");
      });
    });

    it("uses the provided override when supplied", () => {
      withEnv("SUPERADMIN_USERNAME", "supremeadmin", () => {
        const configurationService = new ConfigurationService({
          superadminUsername: "ultimateadmin",
        });
        expect(configurationService.superadminUsername)
          .to.eql("ultimateadmin");
      });
    });

    it("returns undefined when no environment variable or override", () => {
      const configurationService = new ConfigurationService();

      expect(configurationService.superadminUsername).to.be.undefined;
    });
  });

  context("for superadmin password", () => {
    it("uses environment variable by default", () => {
      withEnv("SUPERADMIN_PASSWORD", "extremelysecret", () => {
        const configurationService = new ConfigurationService();
        expect(configurationService.superadminPassword)
          .to.eql("extremelysecret");
      });
    });

    it("uses the provided override when supplied", () => {
      withEnv("SUPERADMIN_PASSWORD", "extremelysecret", () => {
        const configurationService = new ConfigurationService({
          superadminPassword: "particularlysecret",
        });
        expect(configurationService.superadminPassword)
          .to.eql("particularlysecret");
      });
    });

    it("returns undefined when no environment variable or override", () => {
      const configurationService = new ConfigurationService();

      expect(configurationService.superadminPassword).to.be.undefined;
    });
  });
});
