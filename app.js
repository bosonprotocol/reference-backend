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
const FileStorageMiddleware = require("./src/api/middlewares/FileStorageMiddleware");
const UserValidationMiddleware = require("./src/api/middlewares/UserValidationMiddleware");
const VoucherValidationMiddleware = require("./src/api/middlewares/VoucherValidationMiddleware");
const PaymentValidationMiddleware = require("./src/api/middlewares/PaymentValidationMiddleware");

const HealthController = require("./src/api/controllers/HealthController");
const UsersController = require("./src/api/controllers/UsersController");
const VoucherSuppliesController = require("./src/api/controllers/VoucherSuppliesController");
const VouchersController = require("./src/api/controllers/VouchersController");
const PaymentsController = require("./src/api/controllers/PaymentsController");
const AdministrationController = require("./src/api/controllers/AdministrationController");
const TestController = require("./src/api/controllers/TestController");

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
const fileStorageMiddleware = new FileStorageMiddleware(
  "fileToUpload",
  configurationService.vouchersBucket
);
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

new Server()
  .withModule(healthModule)
  .withModule(usersModule)
  .withModule(voucherSuppliesModule)
  .withModule(vouchersModule)
  .withModule(paymentsModule)
  .withModule(administrationModule)
  .withModule(testModule)
  .start(process.env.PORT || 3000);
