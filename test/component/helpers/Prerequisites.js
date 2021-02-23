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
}

module.exports = Prerequisites;
