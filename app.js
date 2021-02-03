require("dotenv").config();

const Server = require("./src/server");

const usersRouter = require("./src/api/routes/users-route");
const voucherSuppliesRouter = require("./src/api/routes/supplies-route");
const vouchers = require("./src/api/routes/vouchers-route");
const paymentRouter = require("./src/api/routes/payments-route");
const adminRouter = require("./src/api/routes/admin-route");
const testRouter = require("./src/api/routes/test-route");
const healthRouter = require("./src/api/routes/health-route");

new Server()
  .withRouter("/users", usersRouter)
  .withRouter("/voucher-sets", voucherSuppliesRouter)
  .withRouter("/vouchers", vouchers)
  .withRouter("/payments", paymentRouter)
  .withRouter("/admin", adminRouter)
  .withRouter("/test", testRouter)
  .withRouter("/health", healthRouter)
  .start(process.env.PORT || 3000);
