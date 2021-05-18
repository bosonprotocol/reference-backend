const Server = require("../../../src/Server");

const ConfigurationService = require("../../../src/services/ConfigurationService");
const AuthenticationService = require("../../../src/services/AuthenticationService");

const MongooseClient = require("../../../src/clients/MongooseClient");

const UsersRepository = require("../../../src/database/User/UsersRepository");
const VouchersRepository = require("../../../src/database/Voucher/VouchersRepository");
const VoucherSuppliesRepository = require("../../../src/database/VoucherSupply/VoucherSuppliesRepository");
const PaymentsRepository = require("../../../src/database/Payment/PaymentsRepository");
const EventsRepository = require("../../../src/database/Event/EventsRepository");

const AdministratorAuthenticationMiddleware = require("../../../src/api/middlewares/AdministratorAuthenticationMiddleware");
const UserAuthenticationMiddleware = require("../../../src/api/middlewares/UserAuthenticationMiddleware");

const UsersModule = require("../../../src/modules/UsersModule");
const VoucherSuppliesModule = require("../../../src/modules/VoucherSuppliesModule");
const VouchersModule = require("../../../src/modules/VouchersModule");
const PaymentsModule = require("../../../src/modules/PaymentsModule");
const EventsModule = require("../../../src/modules/EventsModule");
const AdministrationModule = require("../../../src/modules/AdministrationModule");
const HealthModule = require("../../../src/modules/HealthModule");

const Ports = require("../../shared/helpers/Ports");
const FakeFileStore = require("../../shared/fakes/utils/FakeStorage");
const FileValidator = require("../../../src/services/FileValidator");
const FileStorageMiddleware = require("../../../src/api/middlewares/FileStorageMiddleware");

class TestServer {
  constructor() {
    this.portPromise = null;
    this.configurationOverrides = {};
  }

  onAnyPort() {
    this.portPromise = Ports.getAvailablePort();
    return this;
  }

  addConfigurationOverrides(overrides) {
    this.configurationOverrides = {
      ...this.configurationOverrides,
      ...overrides,
    };
    return this;
  }

  async start(port = null) {
    const resolvedPort = port || (this.portPromise && (await this.portPromise));
    if (!resolvedPort) {
      throw new Error("No port provided.");
    }

    const configurationService = new ConfigurationService(
      this.configurationOverrides
    );
    const authenticationService = new AuthenticationService(
      configurationService.tokenSecret
    );

    const mongooseClient = new MongooseClient(
      configurationService.databaseConnectionString,
      configurationService.databaseName,
      configurationService.databaseUsername,
      configurationService.databasePassword
    );

    const usersRepository = new UsersRepository();
    const vouchersRepository = new VouchersRepository();
    const voucherSuppliesRepository = new VoucherSuppliesRepository();
    const paymentsRepository = new PaymentsRepository();
    const eventsRepository = new EventsRepository();

    const administratorAuthenticationMiddleware = new AdministratorAuthenticationMiddleware(
      authenticationService,
      usersRepository
    );
    const userAuthenticationMiddleware = new UserAuthenticationMiddleware(
      configurationService.gcloudSecret,
      authenticationService
    );
    const fakeVoucherImageFileStore = new FakeFileStore();
    const fileValidator = new FileValidator(
      configurationService.imageUploadSupportedMimeTypes,
      configurationService.imageUploadMinimumFileSizeInKB,
      configurationService.imageUploadMaximumFileSizeInKB
    );
    const voucherImageStorageMiddleware = new FileStorageMiddleware(
      configurationService.imageUploadFileFieldName,
      configurationService.imageUploadMaximumFiles,
      fileValidator,
      fakeVoucherImageFileStore
    );

    const dependencies = {
      configurationService,
      authenticationService,

      usersRepository,
      vouchersRepository,
      voucherSuppliesRepository,
      paymentsRepository,
      eventsRepository,

      administratorAuthenticationMiddleware,
      userAuthenticationMiddleware,
      voucherImageStorageMiddleware,
    };

    const healthModule = new HealthModule(dependencies);
    const usersModule = new UsersModule(dependencies);
    const voucherSuppliesModule = new VoucherSuppliesModule(dependencies);
    const vouchersModule = new VouchersModule(dependencies);
    const paymentsModule = new PaymentsModule(dependencies);
    const eventsModule = new EventsModule(dependencies);
    const administrationModule = new AdministrationModule(dependencies);

    return new Server()
      .withMongooseClient(mongooseClient)
      .withModule(healthModule)
      .withModule(usersModule)
      .withModule(voucherSuppliesModule)
      .withModule(vouchersModule)
      .withModule(paymentsModule)
      .withModule(eventsModule)
      .withModule(administrationModule)
      .start(resolvedPort);
  }
}

module.exports = TestServer;
