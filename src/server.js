const express = require("express");
const cors = require("cors");

const MongooseClient = require("./clients/mongoose-client");
const ErrorHandler = require("./api/middlewares/error-handler");

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
    if (serverAddress.family === "IPv6") {
      return `http://[${serverAddress.address}]:${serverAddress.port}`;
    } else {
      return `http://${serverAddress.address}:${serverAddress.port}`;
    }
  }

  withRouter(path, router) {
    this.app.use(path, router.route(express));
    return this;
  }

  start(port) {
    this.app.use(ErrorHandler.apiErrorHandler);

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
