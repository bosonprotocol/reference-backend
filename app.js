require("dotenv").config();

const Server = require("./src/server");

const UsersRoutes = require("./src/api/routes/users-routes");
const VoucherSuppliesRoutes = require("./src/api/routes/supplies-routes");
const VouchersRoutes = require("./src/api/routes/vouchers-routes");
const PaymentRoutes = require("./src/api/routes/payments-routes");
const AdminRoutes = require("./src/api/routes/admin-routes");
const TestRoutes = require("./src/api/routes/test-routes");
const HealthRoutes = require("./src/api/routes/health-routes");

new Server()
  .withRoutes("/users", new UsersRoutes())
  .withRoutes("/voucher-sets", new VoucherSuppliesRoutes())
  .withRoutes("/vouchers", new VouchersRoutes())
  .withRoutes("/payments", new PaymentRoutes())
  .withRoutes("/admin", new AdminRoutes())
  .withRoutes("/test", new TestRoutes())
  .withRoutes("/health", new HealthRoutes())
  .start(process.env.PORT || 3000);
