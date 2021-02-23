require("dotenv").config();

const Server = require("./src/server");

const ConfigurationService = require("./src/services/configuration-service.js");
const AuthenticationService = require("./src/services/authentication-service");

const UsersRepository = require("./src/database/User/users-repository");
const VouchersRepository = require("./src/database/Voucher/vouchers-repository");
const VoucherSuppliesRepository = require("./src/database/VoucherSupply/voucher-supplies-repository");
const PaymentsRepository = require("./src/database/Payment/payments-repository");

const AdministratorAuthenticationMiddleware = require("./src/api/middlewares/AdministratorAuthenticationMiddleware");
const UserAuthenticationMiddleware = require("./src/api/middlewares/UserAuthenticationMiddleware");

const UsersModule = require("./src/modules/UsersModule");
const VoucherSuppliesModule = require("./src/modules/VoucherSuppliesModule");
const VouchersModule = require("./src/modules/VouchersModule");
const PaymentsModule = require("./src/modules/PaymentsModule");
const AdministrationModule = require("./src/modules/AdministrationModule");
const TestModule = require("./src/modules/TestModule");
const HealthModule = require("./src/modules/HealthModule");

const configurationService = new ConfigurationService();
const authenticationService = new AuthenticationService(configurationService);

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

const dependencies = {
  configurationService,
  authenticationService,

  usersRepository,
  vouchersRepository,
  voucherSuppliesRepository,
  paymentsRepository,

  administratorAuthenticationMiddleware,
  userAuthenticationMiddleware,
};

const healthModule = new HealthModule(dependencies);
const usersModule = new UsersModule(dependencies);
const voucherSuppliesModule = new VoucherSuppliesModule(dependencies);
const vouchersModule = new VouchersModule(dependencies);
const paymentsModule = new PaymentsModule(dependencies);
const administrationModule = new AdministrationModule(dependencies);
const testModule = new TestModule(dependencies);

new Server()
  .withModule(healthModule)
  .withModule(usersModule)
  .withModule(voucherSuppliesModule)
  .withModule(vouchersModule)
  .withModule(paymentsModule)
  .withModule(administrationModule)
  .withModule(testModule)
  .start(process.env.PORT || 3000);
