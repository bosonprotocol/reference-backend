require('dotenv').config();
const express = require('express');
const MongooseClient = require('./src/clients/mongoose-client');

const usersRouter = require('./src/api/routes/users-route');
const voucherRouter = require('./src/api/routes/vouchers-route');
const usersVoucherRouter = require('./src/api/routes/user-vouchers-route');
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
app.use('/vouchers', voucherRouter.route(express));
app.use('/test', testRouter.route(express));
app.use('/user-vouchers', usersVoucherRouter.route(express));
app.use('/payments', paymentRouter.route(express));
app.use('/admin', adminRouter.route(express))

// Attach API Error handler
app.use(ErrorHandler.apiErrorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    await MongooseClient.getInstance();
    
    console.info(`App listening on: ` + PORT);
});