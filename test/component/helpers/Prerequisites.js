const Random = require("../../shared/helpers/Random");
const Tokens = require("../../shared/helpers/Tokens");
const { Signing } = require("../../shared/helpers/Signing");

class Prerequisites {
  constructor(api) {
    this.api = api;
  }

  async getUserNonce(account) {
    const address = account.address;
    const userResponse = await this.api.users().post(address);

    return userResponse.body;
  }

  async getUserToken(account) {
    const address = account.address;
    const nonce = await this.getUserNonce(account);
    const domain = Random.signingDomain();
    const signature = await Signing.signAuthenticationMessage(
      account,
      nonce,
      domain
    );

    const tokenResponse = await this.api
      .user(address)
      .signatureVerification()
      .post(domain, signature);

    return tokenResponse.text;
  }

  async getSuperadminToken(superadminUsername, superadminPassword) {
    const response = await this.api
      .administration()
      .logInAsSuperadmin(superadminUsername, superadminPassword);

    return response.text;
  }

  async getAdminToken(superadminUsername, superadminPassword) {
    const superadminToken = await this.getSuperadminToken(
      superadminUsername,
      superadminPassword
    );

    const adminAccount = Random.account();
    await this.getUserNonce(adminAccount);
    const adminAddress = adminAccount.address;

    await this.api
      .withToken(superadminToken)
      .administration()
      .makeAdmin(adminAddress);

    return await this.getUserToken(adminAccount);
  }

  getGCloudToken(gcloudSecret, tokenSecret) {
    return Tokens.sign(
      {
        token: gcloudSecret,
      },
      tokenSecret
    );
  }

  /*
  Extracted as required many times in component tests for VoucherSuppliesModule
   */
  async createVoucherSupplyData() {
    const account = Random.account();
    const token = await this.getUserToken(account);
    const voucherSupplyOwner = account.address;
    const voucherSupplyMetadata = Random.voucherSupplyMetadata();
    const voucherSupplyData = {
      ...voucherSupplyMetadata,
      voucherOwner: voucherSupplyOwner,
    };
    const imageFilePath = "test/fixtures/valid-image.png";

    return [token, voucherSupplyData, imageFilePath];
  }

  async createVoucherSupply(token, voucherSupplyData, imageFilePath) {
    const response = await this.api
      .withToken(token)
      .voucherSupplies()
      .post(voucherSupplyData, imageFilePath);

    const voucherSupplyId = response.body.voucherSupply._id;
    const voucherSupplyOwner = response.body.voucherSupply.voucherOwner;
    const qty = response.body.voucherSupply.qty;
    const supplyTokenId = response.body.voucherSupply._tokenIdSupply;

    return [voucherSupplyId, voucherSupplyOwner, qty, supplyTokenId];
  }

  /*
  Creates the voucher metadata.
  @param overrideHolder - replaces the voucher's holder property
   */
  createVoucherMetadata(overrideHolder) {
    const voucherMetadata = Random.voucherMetadata();

    if (overrideHolder) {
      voucherMetadata._holder = overrideHolder; // replace voucherHolder with override (if provided)
    }

    return voucherMetadata;
  }

  async createVoucher(token, voucherSupplyId, voucherMetadata) {
    const response = await this.api
      .withToken(token)
      .vouchers()
      .commitToBuy(voucherSupplyId, voucherMetadata);

    return [response.status, response.body];
  }

  async createPayment(token, paymentsMetadata) {
    const response = await this.api
      .withToken(token)
      .payments()
      .post(paymentsMetadata);

    return [response.status, response.body];
  }

  createVoucherUpdateDeliveredData(
    voucherTokenId,
    voucherIssuer,
    promiseId,
    supplyTokenId,
    voucherHolder,
    correlationId
  ) {
    return {
      _tokenIdVoucher: voucherTokenId,
      _issuer: voucherIssuer,
      _promiseId: promiseId,
      _tokenIdSupply: supplyTokenId,
      _holder: voucherHolder,
      _correlationId: correlationId,
    };
  }

  createSupplyUpdateTransferData(
    voucherMetadata,
    voucherSupplies,
    quantities,
    voucherOwner
  ) {
    return {
      _tokenIdVoucher: voucherMetadata._tokenIdVoucher,
      _issuer: voucherMetadata._issuer,
      _tokenIdSupply: voucherMetadata._tokenIdSupply,
      _holder: voucherMetadata._holder,
      _correlationId: voucherMetadata._correlationId,
      _promiseId: voucherMetadata._promiseId,
      voucherSupplies: voucherSupplies,
      quantities: quantities,
      voucherOwner: voucherOwner,
    };
  }
}

module.exports = Prerequisites;
