const express = require("express");
const cors = require("cors");

const ErrorHandlingMiddleware = require("./api/middlewares/ErrorHandlingMiddleware");

class Server {
  constructor() {
    this.app = express();

    this.app.use(express.json());
    this.app.use(function (req, res, next) {
      next();
    });
    this.app.use(cors());
  }

  get address() {
    const serverAddress = this.server.address();
    const serverHost =
      serverAddress.family === "IPv6"
        ? `[${serverAddress.address}]`
        : serverAddress.address;

    return `http://${serverHost}:${serverAddress.port}`;
  }

  withModule(module) {
    const router = express.Router();
    this.app.use(module.mountPoint(), module.addRoutesTo(router));
    return this;
  }

  withMongooseClient(mongooseClient) {
    this.mongooseClient = mongooseClient;
    return this;
  }

  start(port) {
    this.app.use(ErrorHandlingMiddleware.apiErrorHandler);

    this.server = this.app.listen(port, async () => {
      await this.mongooseClient.connect();

      console.info(`App listening on: ` + port);
    });
    return this;
  }

  stop() {
    this.server.close(() => {
      console.info(`App shutting down...`);
    });
    return this;
  }
}

module.exports = Server;
