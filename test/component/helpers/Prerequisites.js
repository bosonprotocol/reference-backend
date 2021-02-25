const Random = require("../../shared/helpers/Random");
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

    return [voucherSupplyId, voucherSupplyOwner];
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

    return [response.statusCode, response.body];
  }
}

module.exports = Prerequisites;
