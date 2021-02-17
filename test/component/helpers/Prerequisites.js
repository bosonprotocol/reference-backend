const Random = require("../../shared/helpers/random");
const { Signing } = require("../../shared/helpers/signing");

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
    const nonce = this.getUserNonce(account);
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

    return tokenResponse.body;
  }
}

module.exports = Prerequisites;
