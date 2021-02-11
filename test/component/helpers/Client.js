const request = require("superagent");

const { Types } = require("../../shared/helpers/signing");

class Client {
  constructor(serverAddress) {
    this.serverAddress = serverAddress;
  }
  
  async getHealth() {
    return request.get(`${this.serverAddress}/health`);
  }

  async createOrUpdateUser(address) {
    return request.post(`${this.serverAddress}/users/${address}`);
  }

  async verifyUserSignature(address, domain, signature) {
    const types = { AuthSignature: Types.AuthSignature };

    return request
      .post(`${this.serverAddress}/users/${address}/verify-signature`)
      .send({ address, domain, types, signature });
  }
}

module.exports = Client;
