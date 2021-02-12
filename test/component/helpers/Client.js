const request = require("superagent");

const { Types } = require("../../shared/helpers/signing");

class Client {
  constructor(serverAddress) {
    this.serverAddress = serverAddress;
  }

  async getHealth() {
    return request.get(`${this.serverAddress}/health`).ok(() => true);
  }

  async createOrUpdateUser(address) {
    return request
      .post(`${this.serverAddress}/users/${address}`)
      .ok(() => true);
  }

  async verifyUserSignature(address, domain, signature) {
    const types = { AuthSignature: Types.AuthSignature };

    return request
      .post(`${this.serverAddress}/users/${address}/verify-signature`)
      .ok(() => true)
      .send({ address, domain, types, signature });
  }
}

module.exports = Client;
