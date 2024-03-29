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
    return superagent.get(`${this.absoluteServerRoute}/`).ok(() => true);
  }

  async getById(id) {
    return superagent.get(`${this.absoluteServerRoute}/${id}`).ok(() => true);
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

  async update(voucherSupplyId, data, imageFilePath) {
    return superagent
      .patch(`${this.absoluteServerRoute}/${voucherSupplyId}`)
      .field(data)
      .attach("fileToUpload", imageFilePath)
      .authBearer(this.token)
      .ok(() => true);
  }

  async setMetadata(voucherSupplyData) {
    return superagent
      .patch(`${this.absoluteServerRoute}/set-supply-meta`)
      .authBearer(this.token)
      .ok(() => true)
      .send(voucherSupplyData);
  }

  async updateOnTransfer(data) {
    return superagent
      .patch(`${this.absoluteServerRoute}/update-supply-ontransfer`)
      .authBearer(this.token)
      .ok(() => true)
      .send(data);
  }

  async updateOnCancel(data) {
    return superagent
      .patch(`${this.absoluteServerRoute}/update-supply-oncancel`)
      .authBearer(this.token)
      .ok(() => true)
      .send(data);
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
      .send({ imageUrl: imageFileUrl });
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

  async getAll() {
    return superagent
      .get(`${this.absoluteServerRoute}/all`)
      .authBearer(this.token)
      .ok(() => true);
  }

  async getAllPublic() {
    return superagent.get(`${this.absoluteServerRoute}/public`).ok(() => true);
  }

  async updateStatus(voucherId, newStatus) {
    return superagent
      .patch(`${this.absoluteServerRoute}/update`)
      .authBearer(this.token)
      .ok(() => true)
      .send({ _id: voucherId, status: newStatus });
  }

  async updateDelivered(data) {
    return superagent
      .patch(`${this.absoluteServerRoute}/update-voucher-delivered`)
      .authBearer(this.token)
      .ok(() => true)
      .send(data);
  }

  async updateFromCommonEvent(voucherTokenId) {
    return superagent
      .patch(`${this.absoluteServerRoute}/update-from-common-event`)
      .authBearer(this.token)
      .ok(() => true)
      .send({
        _tokenIdVoucher: voucherTokenId,
      });
  }

  async updateStatusFromKeepers(voucherTokenId, status) {
    return superagent
      .patch(`${this.absoluteServerRoute}/update-status-from-keepers`)
      .authBearer(this.token)
      .ok(() => true)
      .send([
        {
          _tokenIdVoucher: voucherTokenId,
          status: status,
        },
      ]);
  }

  async commitToBuy(voucherSupplyId, voucherMetaData) {
    return superagent
      .post(`${this.absoluteServerRoute}/commit-to-buy/${voucherSupplyId}`)
      .authBearer(this.token)
      .ok(() => true)
      .send(voucherMetaData);
  }
}

class AdministrationResource {
  constructor(serverAddress, token) {
    this.serverAddress = serverAddress;
    this.absoluteServerRoute = `${serverAddress}/admin`;
    this.token = token;
  }

  async logInAsSuperadmin(username, password) {
    return superagent
      .post(`${this.absoluteServerRoute}/super/login`)
      .auth(username, password)
      .ok(() => true);
  }

  async makeAdmin(address) {
    return superagent
      .patch(`${this.absoluteServerRoute}/${address}`)
      .authBearer(this.token)
      .ok(() => true);
  }

  async changeSupplyVisibleStatus(supplyId) {
    return superagent
      .patch(`${this.absoluteServerRoute}/updateVisibleStatus/${supplyId}`)
      .authBearer(this.token)
      .ok(() => true);
  }
}

class PaymentsResource {
  constructor(serverAddress, token) {
    this.serverAddress = serverAddress;
    this.absoluteServerRoute = `${serverAddress}/payments`;
    this.token = token;
  }

  async getByVoucherId(voucherTokenId) {
    return superagent
      .get(`${this.absoluteServerRoute}/get-payment/${voucherTokenId}`)
      .ok(() => true);
  }

  async getActors(voucherTokenId) {
    return superagent
      .get(`${this.absoluteServerRoute}/${voucherTokenId}`)
      .ok(() => true);
  }

  async post(paymentMetadata) {
    return superagent
      .post(`${this.absoluteServerRoute}/create-payment`)
      .authBearer(this.token)
      .ok(() => true)
      .send(paymentMetadata);
  }
}

class EventsResource {
  constructor(serverAddress, token) {
    this.serverAddress = serverAddress;
    this.absoluteServerRoute = `${serverAddress}/events`;
    this.token = token;
  }

  getAll() {
    return superagent.get(`${this.absoluteServerRoute}/all`).ok(() => true);
  }

  getDetected() {
    return superagent
      .get(`${this.absoluteServerRoute}/detected`)
      .ok(() => true);
  }

  getFailed() {
    return superagent.get(`${this.absoluteServerRoute}/failed`).ok(() => true);
  }

  createEvent(data) {
    return superagent
      .post(`${this.absoluteServerRoute}/create`)
      .authBearer(this.token)
      .ok(() => true)
      .send(data);
  }

  updateByCorrelationId(data) {
    return superagent
      .patch(`${this.absoluteServerRoute}/update-by-correlation-id`)
      .authBearer(this.token)
      .ok(() => true)
      .send(data);
  }

  updateByTokenId(data) {
    return superagent
      .patch(`${this.absoluteServerRoute}/update-by-token-id`)
      .authBearer(this.token)
      .ok(() => true)
      .send(data);
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

  events() {
    return new EventsResource(this.serverAddress, this.token);
  }

  payments() {
    return new PaymentsResource(this.serverAddress, this.token);
  }
}

module.exports = API;
