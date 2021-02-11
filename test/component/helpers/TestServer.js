const Server = require("../../../src/server");

const ConfigurationService = require("../../../src/services/configuration-service");
const AuthenticationService = require("../../../src/services/authentication-service");

const UsersRepository = require("../../../src/database/User/users-repository");
const VouchersRepository = require("../../../src/database/Voucher/vouchers-repository");
const VoucherSuppliesRepository = require("../../../src/database/VoucherSupply/voucher-supplies-repository");

const UsersRoutes = require("../../../src/api/routes/users-routes");
const HealthRoutes = require('../../../src/api/routes/health-routes')

const Ports = require('../../shared/helpers/ports')

class TestServer {
  constructor() {
    this.portPromise = null;
    this.configurationOverrides = {};
  }

  onAnyPort() {
    this.portPromise = Ports.getAvailablePort();
    return this;
  }

  withConfigurationOverrides(overrides) {
    this.configurationOverrides = {
      ...this.configurationOverrides,
      ...overrides
    };
    return this;
  }

  async start(port = null) {
    const resolvedPort = port || (this.portPromise && await this.portPromise);
    if (!resolvedPort) {
      throw new Error("No port provided.");
    }

    const configurationService = new ConfigurationService(
      this.configurationOverrides
    );
    const authenticationService = new AuthenticationService({
      configurationService,
    });

    const usersRepository = new UsersRepository();
    const vouchersRepository = new VouchersRepository();
    const voucherSuppliesRepository = new VoucherSuppliesRepository();

    const healthRoutes = new HealthRoutes();
    const usersRoutes = new UsersRoutes(
      authenticationService,
      usersRepository,
      voucherSuppliesRepository,
      vouchersRepository
    );

    return new Server()
      .withRoutes("/health", healthRoutes)
      .withRoutes("/users", usersRoutes)
      .start(resolvedPort);
  }
}

module.exports = TestServer;
