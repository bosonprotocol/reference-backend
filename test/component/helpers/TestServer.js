const Server = require("../../.../../../src/server");

const ConfigurationService = require("../../../src/services/ConfigurationService");
const AuthenticationService = require("../../../src/services/AuthenticationService");

const UsersRepository = require("../../../src/database/User/UsersRepository");
const VouchersRepository = require("../../../src/database/Voucher/VouchersRepository");
const VoucherSuppliesRepository = require("../../../src/database/VoucherSupply/VoucherSuppliesRepository");
const PaymentsRepository = require("../../../src/database/Payment/PaymentsRepository");

const AdministratorAuthenticationMiddleware = require("../../../src/api/middlewares/AdministratorAuthenticationMiddleware");
const UserAuthenticationMiddleware = require("../../../src/api/middlewares/UserAuthenticationMiddleware");

const UsersModule = require("../../../src/modules/UsersModule");
const VoucherSuppliesModule = require("../../../src/modules/VoucherSuppliesModule");
const VouchersModule = require("../../../src/modules/VouchersModule");
const PaymentsModule = require("../../../src/modules/PaymentsModule");
const AdministrationModule = require("../../../src/modules/AdministrationModule");
const TestModule = require("../../../src/modules/TestModule");
const HealthModule = require("../../../src/modules/HealthModule");

const Ports = require("../../shared/helpers/Ports");
const FakeFileStorageMiddleware = require("../helpers/FakeFileStorageMiddleware");

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
      configurationService
    );

    const usersRepository = new UsersRepository();
    const vouchersRepository = new VouchersRepository();
    const voucherSuppliesRepository = new VoucherSuppliesRepository();
    const paymentsRepository = new PaymentsRepository();

    const administratorAuthenticationMiddleware = new AdministratorAuthenticationMiddleware(
      authenticationService,
      usersRepository
    );
    const userAuthenticationMiddleware = new UserAuthenticationMiddleware(
      configurationService,
      authenticationService
    );
    const voucherImageStorageMiddleware = new FakeFileStorageMiddleware(
      "fileToUpload"
    );

    const dependencies = {
      configurationService,
      authenticationService,

      usersRepository,
      vouchersRepository,
      voucherSuppliesRepository,
      paymentsRepository,

      administratorAuthenticationMiddleware,
      userAuthenticationMiddleware,
      voucherImageStorageMiddleware,
    };

    const healthModule = new HealthModule(dependencies);
    const usersModule = new UsersModule(dependencies);
    const voucherSuppliesModule = new VoucherSuppliesModule(dependencies);
    const vouchersModule = new VouchersModule(dependencies);
    const paymentsModule = new PaymentsModule(dependencies);
    const administrationModule = new AdministrationModule(dependencies);
    const testModule = new TestModule(dependencies);

    return new Server()
      .withModule(healthModule)
      .withModule(usersModule)
      .withModule(voucherSuppliesModule)
      .withModule(vouchersModule)
      .withModule(paymentsModule)
      .withModule(administrationModule)
      .withModule(testModule)
      .start(resolvedPort);
  }
}

module.exports = TestServer;
