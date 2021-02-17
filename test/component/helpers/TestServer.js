const Server = require("../../.../../../src/server");

const ConfigurationService = require("../../../src/services/configuration-service.js");
const AuthenticationService = require("../../../src/services/authentication-service");

const UsersRepository = require("../../../src/database/User/users-repository");
const VouchersRepository = require("../../../src/database/Voucher/vouchers-repository");
const VoucherSuppliesRepository = require("../../../src/database/VoucherSupply/voucher-supplies-repository");
const PaymentsRepository = require("../../../src/database/Payment/payments-repository");

const AdministratorAuthenticationMiddleware = require("../../../src/api/middlewares/administrator-authentication");
const UserAuthenticationMiddleware = require("../../../src/api/middlewares/user-authentication");
const UserValidationMiddleware = require("../../../src/api/middlewares/user-validation");
const VoucherValidationMiddleware = require("../../../src/api/middlewares/voucher-validation");
const PaymentValidationMiddleware = require("../../../src/api/middlewares/payment-validation");

const HealthController = require("../../../src/api/controllers/health-controller");
const UsersController = require("../../../src/api/controllers/users-controller");
const VoucherSuppliesController = require("../../../src/api/controllers/voucher-supplies-controller");
const VouchersController = require("../../../src/api/controllers/vouchers-controller");
const PaymentsController = require("../../../src/api/controllers/payments-controller");
const AdministrationController = require("../../../src/api/controllers/administration-controller");
const TestController = require("../../../src/api/controllers/test-controller");

const UsersModule = require("../../../src/api/modules/UsersModule");
const VoucherSuppliesModule = require("../../../src/api/modules/VoucherSuppliesModule");
const VouchersModule = require("../../../src/api/modules/VouchersModule");
const PaymentsModule = require("../../../src/api/modules/PaymentsModule");
const AdministrationModule = require("../../../src/api/modules/AdministrationModule");
const TestModule = require("../../../src/api/modules/TestModule");
const HealthModule = require("../../../src/api/modules/HealthModule");

const Ports = require("../../shared/helpers/ports");
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
    const fileStorageMiddleware = new FakeFileStorageMiddleware("fileToUpload");
    const userValidationMiddleware = new UserValidationMiddleware(
      vouchersRepository
    );
    const voucherValidationMiddleware = new VoucherValidationMiddleware(
      voucherSuppliesRepository
    );
    const paymentValidationMiddleware = new PaymentValidationMiddleware();

    const healthController = new HealthController();
    const usersController = new UsersController(
      authenticationService,
      usersRepository,
      voucherSuppliesRepository,
      vouchersRepository
    );
    const voucherSuppliesController = new VoucherSuppliesController(
      voucherSuppliesRepository
    );
    const vouchersController = new VouchersController(
      voucherSuppliesRepository,
      vouchersRepository
    );
    const paymentsController = new PaymentsController(
      vouchersRepository,
      paymentsRepository
    );
    const administrationController = new AdministrationController(
      usersRepository,
      voucherSuppliesRepository
    );
    const testController = new TestController(
      voucherSuppliesRepository,
      vouchersRepository
    );

    const healthModule = new HealthModule(healthController);
    const usersModule = new UsersModule(
      userAuthenticationMiddleware,
      userValidationMiddleware,
      usersController
    );
    const voucherSuppliesModule = new VoucherSuppliesModule(
      userAuthenticationMiddleware,
      fileStorageMiddleware,
      voucherValidationMiddleware,
      voucherSuppliesController
    );
    const vouchersModule = new VouchersModule(
      userAuthenticationMiddleware,
      userValidationMiddleware,
      vouchersController
    );
    const paymentsModule = new PaymentsModule(
      userAuthenticationMiddleware,
      paymentValidationMiddleware,
      paymentsController
    );
    const administrationModule = new AdministrationModule(
      administratorAuthenticationMiddleware,
      administrationController
    );
    const testModule = new TestModule(testController);

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
