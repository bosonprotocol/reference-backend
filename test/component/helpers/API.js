const superagent = require("superagent-auth-bearer")(require("superagent"));

const { Types } = require("../../shared/helpers/Signing");

class HealthResource {
  constructor(serverAddress) {
    this.serverAddress = serverAddress;
  }

  async get() {
    return superagent.get(`${this.serverAddress}/health`).ok(() => true);
  }
}

class UsersResource {
  constructor(serverAddress, token) {
    this.serverAddress = serverAddress;
    this.token = token;
  }

  // TODO: The method here should be PUT and we should move this to UserResource
  //       as we are "upserting" a user rather than creating a resource under
  //       the user.
  async post(address) {
    return superagent
      .post(`${this.serverAddress}/users/${address}`)
      .ok(() => true);
  }

  async commitToBuy(voucherSupplyId, voucherMetaData) {
    return superagent
        .post(`${this.serverAddress}/users/${voucherSupplyId}/buy`)
        .authBearer(this.token)
        .ok(() => true)
        .send(voucherMetaData);
  }
}

class UserSignatureVerificationResource {
  constructor(serverAddress, userAddress) {
    this.serverAddress = serverAddress;
    this.userAddress = userAddress;
  }

  async post(domain, signature) {
    const types = { AuthSignature: Types.AuthSignature };

    return superagent
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

class VoucherSuppliesResource {
  constructor(serverAddress, token) {
    this.serverAddress = serverAddress;
    this.absoluteServerRoute = `${serverAddress}/voucher-sets`;
    this.token = token;
  }

  async post(voucherSupplyData, imageFilePath) {
    return superagent
      .post(`${this.absoluteServerRoute}`)
      .field(voucherSupplyData)
      .attach("fileToUpload", imageFilePath)
      .authBearer(this.token)
      .ok(() => true);
  }

  async getAll() {
    return superagent
        .get(`${this.absoluteServerRoute}/`)
        .ok(() => true);
  }

  async getById(id) {
    return superagent
        .get(`${this.absoluteServerRoute}/${id}`)
        .ok(() => true);
  }

  async getStatuses() {
    return superagent
        .get(`${this.absoluteServerRoute}/status/all`)
        .authBearer(this.token)
        .ok(() => true);
  }

  async getActive() {
    return superagent
        .get(`${this.absoluteServerRoute}/status/active`)
        .authBearer(this.token)
        .ok(() => true);
  }

  async getInactive() {
    return superagent
        .get(`${this.absoluteServerRoute}/status/inactive`)
        .authBearer(this.token)
        .ok(() => true);
  }

  async getBySeller(address) {
    return superagent
        .get(`${this.absoluteServerRoute}/sell/${address}`)
        .ok(() => true);
  }

  async getByBuyer(address) {
    return superagent
        .get(`${this.absoluteServerRoute}/buy/${address}`)
        .ok(() => true);
  }

  async update(voucherSupplyId, imageFilePath) {
    return superagent
        .patch(`${this.absoluteServerRoute}/${voucherSupplyId}`)
        .attach("fileToUpload", imageFilePath)
        .authBearer(this.token)
        .ok(() => true);
  }

  async delete(voucherSupplyId) {
    return superagent
        .delete(`${this.absoluteServerRoute}/${voucherSupplyId}`)
        .authBearer(this.token)
        .ok(() => true);
  }

  async deleteImage(voucherSupplyId, imageFileUrl) {
    return superagent
        .delete(`${this.absoluteServerRoute}/${voucherSupplyId}/image`)
        .authBearer(this.token)
        .ok(() => true)
        .send({ imageUrl: imageFileUrl })
  }
}

class VouchersResource {
  constructor(serverAddress, token) {
    this.serverAddress = serverAddress;
    this.absoluteServerRoute = `${serverAddress}/vouchers`;
    this.token = token;
  }

  async getVouchers() {
    return superagent
        .get(`${this.absoluteServerRoute}/`)
        .authBearer(this.token)
        .ok(() => true);
  }

  async getVoucherDetails(voucherId) {
    return superagent
        .get(`${this.absoluteServerRoute}/${voucherId}/voucher-details`)
        .authBearer(this.token)
        .ok(() => true);
  }

  async getBoughtVouchers(supplyId) {
    return superagent
        .get(`${this.absoluteServerRoute}/buyers/${supplyId}`)
        .authBearer(this.token)
        .ok(() => true);
  }

  async getAllPublic() {
    return superagent
        .get(`${this.absoluteServerRoute}/public`)
        .ok(() => true);
  }

  async update(newStatus, voucherId) {
    return superagent
        .patch(`${this.absoluteServerRoute}/update`)
        .authBearer(this.token)
        .ok(() => true)
        .send({ _id: voucherId, status: newStatus })
  }
}

class AdministrationResource {
  constructor(serverAddress, token) {
    this.serverAddress = serverAddress;
    this.absoluteServerRoute = `${serverAddress}/admin`;
    this.token = token;
  }

  async makeAdmin(address) {
    return superagent
        .patch(`${this.absoluteServerRoute}/${address}`)
        .authBearer(this.token)
        .ok(() => true);
  }
}

class API {
  constructor(serverAddress) {
    this.serverAddress = serverAddress;
    this.token = null;
  }

  withToken(token) {
    this.token = token;
    return this;
  }

  health() {
    return new HealthResource(this.serverAddress);
  }

  users() {
    return new UsersResource(this.serverAddress, this.token);
  }

  user(address) {
    return new UserResource(this.serverAddress, address);
  }

  voucherSupplies() {
    return new VoucherSuppliesResource(this.serverAddress, this.token);
  }

  vouchers() {
    return new VouchersResource(this.serverAddress, this.token);
  }

  administration() {
    return new AdministrationResource(this.serverAddress, this.token);
  }
}

module.exports = API;
