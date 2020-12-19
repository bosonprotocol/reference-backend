require('dotenv').config();
const express = require('express');
const MongooseClient = require('./src/clients/mongoose-client');

const usersRouter = require('./src/api/routes/users-route');
const voucherSuppliesRouter = require('./src/api/routes/supplies-route');
const vouchers = require('./src/api/routes/vouchers-route');
const paymentRouter = require('./src/api/routes/payments-route');
const adminRouter = require('./src/api/routes/admin-route');
const testRouter = require('./src/api/routes/test-route');
const ErrorHandler = require('./src/api/middlewares/error-handler');

const cors = require('cors');

const app = express();

app.use(cors());
app.use(function (req, res, next) {
    console.log('Time:', Date.now())
    next()
});
app.use(express.json());

app.use('/users', usersRouter.route(express));
app.use('/voucher-sets', voucherSuppliesRouter.route(express));
app.use('/vouchers', vouchers.route(express));
app.use('/payments', paymentRouter.route(express));
app.use('/admin', adminRouter.route(express))
app.use('/test', testRouter.route(express));

// Attach API Error handler
app.use(ErrorHandler.apiErrorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    await MongooseClient.getInstance();
    
    console.info(`App listening on: ` + PORT);
});
