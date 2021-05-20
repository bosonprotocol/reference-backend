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
      withEnv("DB_CONNECTION_STRING", "mongodb://localhost:27017", () => {
        const configurationService = new ConfigurationService();
        expect(configurationService.databaseConnectionString).to.eql(
          "mongodb://localhost:27017"
        );
      });
    });

    it("uses the provided override when supplied", () => {
      withEnv("DB_CONNECTION_STRING", "mongodb://localhost:27017", () => {
        const configurationService = new ConfigurationService({
          databaseConnectionString: "mongodb://mongo.example.com:27017",
        });
        expect(configurationService.databaseConnectionString).to.eql(
          "mongodb://mongo.example.com:27017"
        );
      });
    });

    it("uses localhost:27017 when no environment variable or override", () => {
      const configurationService = new ConfigurationService();

      expect(configurationService.databaseConnectionString).to.eql(
        "mongodb://localhost:27017"
      );
    });
  });

  context("for database name", () => {
    it("uses environment variable when present", () => {
      withEnv("DB_NAME", "service", () => {
        const configurationService = new ConfigurationService();
        expect(configurationService.databaseName).to.eql("service");
      });
    });

    it("uses the provided override when supplied", () => {
      withEnv("DB_NAME", "service", () => {
        const configurationService = new ConfigurationService({
          databaseName: "backend",
        });
        expect(configurationService.databaseName).to.eql("backend");
      });
    });

    it("uses api when no environment variable or override", () => {
      const configurationService = new ConfigurationService();

      expect(configurationService.databaseName).to.eql("api");
    });
  });

  context("for database username", () => {
    it("uses environment variable when present", () => {
      withEnv("DB_USERNAME", "user", () => {
        const configurationService = new ConfigurationService();
        expect(configurationService.databaseUsername).to.eql("user");
      });
    });

    it("uses the provided override when supplied", () => {
      withEnv("DB_USERNAME", "user", () => {
        const configurationService = new ConfigurationService({
          databaseUsername: "app",
        });
        expect(configurationService.databaseUsername).to.eql("app");
      });
    });

    it("uses admin when no environment variable or override", () => {
      const configurationService = new ConfigurationService();

      expect(configurationService.databaseUsername).to.eql("admin");
    });
  });

  context("for database password", () => {
    it("uses environment variable when present", () => {
      withEnv("DB_PASSWORD", "password", () => {
        const configurationService = new ConfigurationService();
        expect(configurationService.databasePassword).to.eql("password");
      });
    });

    it("uses the provided override when supplied", () => {
      withEnv("DB_PASSWORD", "password", () => {
        const configurationService = new ConfigurationService({
          databasePassword: "pass",
        });
        expect(configurationService.databasePassword).to.eql("pass");
      });
    });

    it("uses admin when no environment variable or override", () => {
      const configurationService = new ConfigurationService();

      expect(configurationService.databasePassword).to.eql("secret");
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

  context("for image upload file field name", () => {
    it("uses environment variable by default", () => {
      withEnv("IMAGE_UPLOAD_FILE_FIELD_NAME", "someField", () => {
        const configurationService = new ConfigurationService();
        expect(configurationService.imageUploadFileFieldName).to.eql(
          "someField"
        );
      });
    });

    it("uses the provided override when supplied", () => {
      withEnv("IMAGE_UPLOAD_FILE_FIELD_NAME", "someField", () => {
        const configurationService = new ConfigurationService({
          imageUploadFileFieldName: "otherField",
        });
        expect(configurationService.imageUploadFileFieldName).to.eql(
          "otherField"
        );
      });
    });

    it("returns fileToUpload when no environment variable or override", () => {
      const configurationService = new ConfigurationService();

      expect(configurationService.imageUploadFileFieldName).to.eql(
        "fileToUpload"
      );
    });
  });

  context("for image upload storage engine", () => {
    it("uses environment variable by default", () => {
      withEnv("IMAGE_UPLOAD_STORAGE_ENGINE", "AWS", () => {
        const configurationService = new ConfigurationService();
        expect(configurationService.imageUploadStorageEngine).to.eql("AWS");
      });
    });

    it("uses the provided override when supplied", () => {
      withEnv("IMAGE_UPLOAD_STORAGE_ENGINE", "AWS", () => {
        const configurationService = new ConfigurationService({
          imageUploadStorageEngine: "GCP",
        });
        expect(configurationService.imageUploadStorageEngine).to.eql("GCP");
      });
    });

    it("returns GCP when no environment variable or override", () => {
      const configurationService = new ConfigurationService();

      expect(configurationService.imageUploadStorageEngine).to.eql("GCP");
    });
  });

  context("for image upload storage bucket name", () => {
    it("uses new environment variable by default", () => {
      withEnv("IMAGE_UPLOAD_STORAGE_BUCKET_NAME", "some-new-bucket", () => {
        withEnv("VOUCHERS_BUCKET", "some-old-bucket", () => {
          const configurationService = new ConfigurationService();
          expect(configurationService.imageUploadStorageBucketName).to.eql(
            "some-new-bucket"
          );
        });
      });
    });

    it("uses old environment variable if new not set", () => {
      withEnv("VOUCHERS_BUCKET", "some-old-bucket", () => {
        const configurationService = new ConfigurationService();
        expect(configurationService.imageUploadStorageBucketName).to.eql(
          "some-old-bucket"
        );
      });
    });

    it("uses the provided override when supplied", () => {
      withEnv("IMAGE_UPLOAD_STORAGE_BUCKET_NAME", "some-bucket", () => {
        const configurationService = new ConfigurationService({
          imageUploadStorageBucketName: "some-other-bucket",
        });
        expect(configurationService.imageUploadStorageBucketName).to.eql(
          "some-other-bucket"
        );
      });
    });

    it("returns undefined when no environment variable or override", () => {
      const configurationService = new ConfigurationService();

      expect(configurationService.imageUploadStorageBucketName).to.be.undefined;
    });
  });

  context("for image upload supported mime types", () => {
    it("uses environment variable by default", () => {
      withEnv(
        "IMAGE_UPLOAD_SUPPORTED_MIME_TYPES",
        "image/gif,image/png",
        () => {
          const configurationService = new ConfigurationService();
          expect(configurationService.imageUploadSupportedMimeTypes).to.eql([
            "image/gif",
            "image/png",
          ]);
        }
      );
    });

    it("uses the provided override when supplied", () => {
      withEnv(
        "IMAGE_UPLOAD_SUPPORTED_MIME_TYPES",
        "image/gif,image/png",
        () => {
          const configurationService = new ConfigurationService({
            imageUploadSupportedMimeTypes: ["image/jpeg"],
          });
          expect(configurationService.imageUploadSupportedMimeTypes).to.eql([
            "image/jpeg",
          ]);
        }
      );
    });

    it("returns jpeg or png when no environment variable or override", () => {
      const configurationService = new ConfigurationService();

      expect(configurationService.imageUploadSupportedMimeTypes).to.eql([
        "image/jpeg",
        "image/png",
      ]);
    });
  });

  context("for image upload minimum file size", () => {
    it("uses environment variable by default", () => {
      withEnv("IMAGE_UPLOAD_MINIMUM_FILE_SIZE_IN_KB", "15", () => {
        const configurationService = new ConfigurationService();
        expect(configurationService.imageUploadMinimumFileSizeInKB).to.eql(15);
      });
    });

    it("uses the provided override when supplied", () => {
      withEnv("IMAGE_UPLOAD_MINIMUM_FILE_SIZE_IN_KB", "10", () => {
        const configurationService = new ConfigurationService({
          imageUploadMinimumFileSizeInKB: 20,
        });
        expect(configurationService.imageUploadMinimumFileSizeInKB).to.eql(20);
      });
    });

    it("returns 10KBs when no environment variable or override", () => {
      const configurationService = new ConfigurationService();

      expect(configurationService.imageUploadMinimumFileSizeInKB).to.eql(10);
    });
  });

  context("for image upload maximum file size", () => {
    it("uses environment variable by default", () => {
      withEnv("IMAGE_UPLOAD_MAXIMUM_FILE_SIZE_IN_KB", "10240", () => {
        const configurationService = new ConfigurationService();
        expect(configurationService.imageUploadMaximumFileSizeInKB).to.eql(
          10240
        );
      });
    });

    it("uses the provided override when supplied", () => {
      withEnv("IMAGE_UPLOAD_MAXIMUM_FILE_SIZE_IN_KB", "5120", () => {
        const configurationService = new ConfigurationService({
          imageUploadMaximumFileSizeInKB: 7168,
        });
        expect(configurationService.imageUploadMaximumFileSizeInKB).to.eql(
          7168
        );
      });
    });

    it("returns 5120KBs when no environment variable or override", () => {
      const configurationService = new ConfigurationService();

      expect(configurationService.imageUploadMaximumFileSizeInKB).to.eql(5120);
    });
  });

  context("for image upload maximum files", () => {
    it("uses environment variable by default", () => {
      withEnv("IMAGE_UPLOAD_MAXIMUM_FILES", "15", () => {
        const configurationService = new ConfigurationService();
        expect(configurationService.imageUploadMaximumFiles).to.eql(15);
      });
    });

    it("uses the provided override when supplied", () => {
      withEnv("IMAGE_UPLOAD_MAXIMUM_FILES", "15", () => {
        const configurationService = new ConfigurationService({
          imageUploadMaximumFiles: 20,
        });
        expect(configurationService.imageUploadMaximumFiles).to.eql(20);
      });
    });

    it("returns 10 when no environment variable or override", () => {
      const configurationService = new ConfigurationService();

      expect(configurationService.imageUploadMaximumFiles).to.eql(10);
    });
  });

  context("for superadmin username", () => {
    it("uses environment variable by default", () => {
      withEnv("SUPERADMIN_USERNAME", "supremeadmin", () => {
        const configurationService = new ConfigurationService();
        expect(configurationService.superadminUsername).to.eql("supremeadmin");
      });
    });

    it("uses the provided override when supplied", () => {
      withEnv("SUPERADMIN_USERNAME", "supremeadmin", () => {
        const configurationService = new ConfigurationService({
          superadminUsername: "ultimateadmin",
        });
        expect(configurationService.superadminUsername).to.eql("ultimateadmin");
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
        expect(configurationService.superadminPassword).to.eql(
          "extremelysecret"
        );
      });
    });

    it("uses the provided override when supplied", () => {
      withEnv("SUPERADMIN_PASSWORD", "extremelysecret", () => {
        const configurationService = new ConfigurationService({
          superadminPassword: "particularlysecret",
        });
        expect(configurationService.superadminPassword).to.eql(
          "particularlysecret"
        );
      });
    });

    it("returns undefined when no environment variable or override", () => {
      const configurationService = new ConfigurationService();

      expect(configurationService.superadminPassword).to.be.undefined;
    });
  });
});
