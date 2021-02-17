const Server = require("../../.../../../src/server");

const ConfigurationService = require("../../../src/services/configuration-service.js");
const AuthenticationService = require("../../../src/services/authentication-service");

const UsersRepository = require("../../../src/database/User/users-repository");
const VouchersRepository = require("../../../src/database/Voucher/vouchers-repository");
const VoucherSuppliesRepository = require("../../../src/database/VoucherSupply/voucher-supplies-repository");
const PaymentsRepository = require("../../../src/database/Payment/payments-repository");

const AdministratorAuthenticationMiddleware = require("../../../src/api/middlewares/administrator-authentication");
const AuthenticationMiddleware = require("../../../src/api/middlewares/authentication");
const UserValidatorMiddleware = require("../../../src/api/middlewares/user-validator");
const VoucherValidatorMiddleware = require("../../../src/api/middlewares/voucher-validator");
const PaymentValidatorMiddleware = require("../../../src/api/middlewares/payment-validator");

const HealthController = require("../../../src/api/controllers/health-controller");
const UsersController = require("../../../src/api/controllers/users-controller");
const VoucherSuppliesController = require("../../../src/api/controllers/voucher-supplies-controller");
const VouchersController = require("../../../src/api/controllers/vouchers-controller");
const PaymentsController = require("../../../src/api/controllers/payments-controller");
const AdministrationController = require("../../../src/api/controllers/administration-controller");
const TestController = require("../../../src/api/controllers/test-controller");

const UsersRoutes = require("../../../src/api/routes/users-routes");
const VoucherSuppliesRoutes = require("../../../src/api/routes/supplies-routes");
const VouchersRoutes = require("../../../src/api/routes/vouchers-routes");
const PaymentsRoutes = require("../../../src/api/routes/payments-routes");
const AdministrationRoutes = require("../../../src/api/routes/administration-routes");
const TestRoutes = require("../../../src/api/routes/test-routes");
const HealthRoutes = require("../../../src/api/routes/health-routes");

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
    const authenticationMiddleware = new AuthenticationMiddleware(
      configurationService,
      authenticationService
    );
    const fileStorageMiddleware = new FakeFileStorageMiddleware("fileToUpload");
    const userValidatorMiddleware = new UserValidatorMiddleware(
      vouchersRepository
    );
    const voucherValidatorMiddleware = new VoucherValidatorMiddleware(
      voucherSuppliesRepository
    );
    const paymentValidatorMiddleware = new PaymentValidatorMiddleware();

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

    const healthRoutes = new HealthRoutes(healthController);
    const usersRoutes = new UsersRoutes(
      authenticationMiddleware,
      userValidatorMiddleware,
      usersController
    );
    const voucherSuppliesRoutes = new VoucherSuppliesRoutes(
      authenticationMiddleware,
      fileStorageMiddleware,
      voucherSuppliesController,
      voucherValidatorMiddleware
    );
    const vouchersRoutes = new VouchersRoutes(
      authenticationMiddleware,
      userValidatorMiddleware,
      vouchersController
    );
    const paymentsRoutes = new PaymentsRoutes(
      authenticationMiddleware,
      paymentValidatorMiddleware,
      paymentsController
    );
    const administrationRoutes = new AdministrationRoutes(
      administratorAuthenticationMiddleware,
      administrationController
    );
    const testRoutes = new TestRoutes(testController);

    return new Server()
      .withRoutes("/health", healthRoutes)
      .withRoutes("/users", usersRoutes)
      .withRoutes("/voucher-sets", voucherSuppliesRoutes)
      .withRoutes("/vouchers", vouchersRoutes)
      .withRoutes("/payments", paymentsRoutes)
      .withRoutes("/admin", administrationRoutes)
      .withRoutes("/test", testRoutes)
      .start(resolvedPort);
  }
}

module.exports = TestServer;
