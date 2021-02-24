require("dotenv").config();

const Server = require("./src/server");

const ConfigurationService = require("./src/services/ConfigurationService.js");
const AuthenticationService = require("./src/services/AuthenticationService");

const UsersRepository = require("./src/database/User/UsersRepository");
const VouchersRepository = require("./src/database/Voucher/VouchersRepository");
const VoucherSuppliesRepository = require("./src/database/VoucherSupply/VoucherSuppliesRepository");
const PaymentsRepository = require("./src/database/Payment/PaymentsRepository");

const AdministratorAuthenticationMiddleware = require("./src/api/middlewares/AdministratorAuthenticationMiddleware");
const UserAuthenticationMiddleware = require("./src/api/middlewares/UserAuthenticationMiddleware");

const UsersModule = require("./src/modules/UsersModule");
const VoucherSuppliesModule = require("./src/modules/VoucherSuppliesModule");
const VouchersModule = require("./src/modules/VouchersModule");
const PaymentsModule = require("./src/modules/PaymentsModule");
const AdministrationModule = require("./src/modules/AdministrationModule");
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

new Server()
  .withModule(healthModule)
  .withModule(usersModule)
  .withModule(voucherSuppliesModule)
  .withModule(vouchersModule)
  .withModule(paymentsModule)
  .withModule(administrationModule)
  .start(process.env.PORT || 3000);
