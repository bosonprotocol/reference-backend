const freeport = require("freeport");

class Ports {
  static getAvailablePort() {
    return new Promise((resolve, reject) => {
      freeport((error, port) => {
        if (error) {
          return reject(error);
        }

        return resolve(port);
      });
    });
  }
}

module.exports = Ports;
