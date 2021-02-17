require("dotenv").config();

const Server = require("./src/server");

const ConfigurationService = require("./src/services/configuration-service.js");
const AuthenticationService = require("./src/services/authentication-service");

const UsersRepository = require("./src/database/User/users-repository");
const VouchersRepository = require("./src/database/Voucher/vouchers-repository");
const VoucherSuppliesRepository = require("./src/database/VoucherSupply/voucher-supplies-repository");
const PaymentsRepository = require("./src/database/Payment/payments-repository");

const AdministratorAuthenticationMiddleware = require("./src/api/middlewares/administrator-authentication");
const UserAuthenticationMiddleware = require("./src/api/middlewares/user-authentication");
const FileStorageMiddleware = require("./src/api/middlewares/file-storage");
const UserValidationMiddleware = require("./src/api/middlewares/user-validation");
const VoucherValidationMiddleware = require("./src/api/middlewares/voucher-validation");
const PaymentValidationMiddleware = require("./src/api/middlewares/payment-validation");

const HealthController = require("./src/api/controllers/health-controller");
const UsersController = require("./src/api/controllers/users-controller");
const VoucherSuppliesController = require("./src/api/controllers/voucher-supplies-controller");
const VouchersController = require("./src/api/controllers/vouchers-controller");
const PaymentsController = require("./src/api/controllers/payments-controller");
const AdministrationController = require("./src/api/controllers/administration-controller");
const TestController = require("./src/api/controllers/test-controller");

const UsersRoutes = require("./src/api/routes/users-routes");
const VoucherSuppliesRoutes = require("./src/api/routes/supplies-routes");
const VouchersRoutes = require("./src/api/routes/vouchers-routes");
const PaymentsRoutes = require("./src/api/routes/payments-routes");
const AdministrationRoutes = require("./src/api/routes/administration-routes");
const TestRoutes = require("./src/api/routes/test-routes");
const HealthRoutes = require("./src/api/routes/health-routes");

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

const healthRoutes = new HealthRoutes(healthController);
const usersRoutes = new UsersRoutes(
  userAuthenticationMiddleware,
  userValidationMiddleware,
  usersController
);
const voucherSuppliesRoutes = new VoucherSuppliesRoutes(
  userAuthenticationMiddleware,
  fileStorageMiddleware,
  voucherValidationMiddleware,
  voucherSuppliesController
);
const vouchersRoutes = new VouchersRoutes(
  userAuthenticationMiddleware,
  userValidationMiddleware,
  vouchersController
);
const paymentsRoutes = new PaymentsRoutes(
  userAuthenticationMiddleware,
  paymentValidationMiddleware,
  paymentsController
);
const administrationRoutes = new AdministrationRoutes(
  administratorAuthenticationMiddleware,
  administrationController
);
const testRoutes = new TestRoutes(testController);

new Server()
  .withRoutes("/health", healthRoutes)
  .withRoutes("/users", usersRoutes)
  .withRoutes("/voucher-sets", voucherSuppliesRoutes)
  .withRoutes("/vouchers", vouchersRoutes)
  .withRoutes("/payments", paymentsRoutes)
  .withRoutes("/admin", administrationRoutes)
  .withRoutes("/test", testRoutes)
  .start(process.env.PORT || 3000);
