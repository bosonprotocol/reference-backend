require('dotenv').config();
const express = require('express');
const MongooseClient = require('./src/clients/mongoose-client');

const usersRouter = require('./src/api/routes/users-route');
const productRouter = require('./src/api/routes/product-route');
const voucherRouter = require('./src/api/routes/vouchers-route');
const ErrorHandler = require('./src/api/middlewares/error-handler');

const cors = require('cors');

const app = express();

app.use(cors());
app.use(function (req, res, next) {
    console.log('Time:', Date.now())
    next()
});
app.use(express.json());
app.use('/', productRouter.route(express));
app.use('/users', usersRouter.route(express));
app.use('/vouchers', voucherRouter.route(express));
// Attach API Error handler
app.use(ErrorHandler.apiErrorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    await MongooseClient.getInstance();
    
    console.info(`App listening on: ` + PORT);
});