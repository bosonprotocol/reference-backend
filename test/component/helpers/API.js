const request = require("superagent");

const { Types } = require("../../shared/helpers/signing");

class HealthResource {
  constructor(serverAddress) {
    this.serverAddress = serverAddress;
  }

  async get() {
    return request.get(`${this.serverAddress}/health`).ok(() => true);
  }
}

class UsersResource {
  constructor(serverAddress) {
    this.serverAddress = serverAddress;
  }

  // TODO: The method here should be PUT and we should move this to UserResource
  //       as we are "upserting" a user rather than creating a resource under
  //       the user.
  async post(address) {
    return request
      .post(`${this.serverAddress}/users/${address}`)
      .ok(() => true);
  }
}

class UserSignatureVerificationResource {
  constructor(serverAddress, userAddress) {
    this.serverAddress = serverAddress;
    this.userAddress = userAddress;
  }

  async post(domain, signature) {
    const types = { AuthSignature: Types.AuthSignature };

    return request
      .post(`${this.serverAddress}/users/${this.userAddress}/verify-signature`)
      .ok(() => true)
      .send({ address: this.userAddress, domain, types, signature });
  }
}

class UserResource {
  constructor(serverAddress, userAddress) {
    this.serverAddress = serverAddress;
    this.userAddress = userAddress;
  }

  signatureVerification() {
    return new UserSignatureVerificationResource(
      this.serverAddress,
      this.userAddress
    );
  }
}

class API {
  constructor(serverAddress) {
    this.serverAddress = serverAddress;
  }

  health() {
    return new HealthResource(this.serverAddress);
  }

  users() {
    return new UsersResource(this.serverAddress);
  }

  user(address) {
    return new UserResource(this.serverAddress, address);
  }
}

module.exports = API;
