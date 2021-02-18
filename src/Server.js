const express = require("express");
const cors = require("cors");

const MongooseClient = require("./clients/MongooseClient");
const ErrorHandlingMiddleware = require("./api/middlewares/ErrorHandlingMiddleware");

class Server {
  constructor() {
    const app = express();

    app.use(express.json());
    app.use(function (req, res, next) {
      console.log("Time:", Date.now());
      next();
    });
    app.use(cors());

    this.app = app;
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

  start(port) {
    this.app.use(ErrorHandlingMiddleware.apiErrorHandler);

    this.server = this.app.listen(port, async () => {
      await MongooseClient.getInstance();

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