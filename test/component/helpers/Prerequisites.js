const Random = require("../../shared/helpers/Random");
const { Signing } = require("../../shared/helpers/Signing");

class Prerequisites {
  constructor(api) {
    this.api = api;
  }

  async getUserNonce(account) {
    const address = account.address;
    const userResponse = await this.api.users().post(address)

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

  /*
  Extracted as required many times in component tests for VoucherSuppliesModule
   */
  async createVoucherSupply() {
    const account = Random.account();
    const token = await this.getUserToken(account);
    const voucherSupplyOwner = account.address;
    const voucherSupplyMetadata = Random.voucherSupplyMetadata();
    const voucherSupplyData = {
      ...voucherSupplyMetadata,
      voucherOwner: voucherSupplyOwner
    };
    const imageFilePath = 'test/fixtures/valid-image.png';

    return [token, voucherSupplyData, imageFilePath];
  }
}

module.exports = Prerequisites;
