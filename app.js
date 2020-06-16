require('dotenv').config();
const express = require('express');
const MongoClient = require('./src/clients/mongo-client')

const usersRouter = require('./src/api/routes/users-route')
const ErrorHandler = require('./src/api/middlewares/error-handler');

const cors = require('cors')

const app = express();

app.use(cors());
app.use(function (req, res, next) {
    console.log('Time:', Date.now())
    next()
})
app.use(express.json());
app.use('/users', usersRouter.route(express))
// Attach API Error handler
app.use(ErrorHandler.apiErrorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    await MongoClient.getInstance();
    console.info(`App listening on: ` + PORT);
});