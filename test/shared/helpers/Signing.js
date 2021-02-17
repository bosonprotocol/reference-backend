const ethers = require("ethers");
const { signTypedData_v4 } = require("eth-sig-util");

const EIP712Domain = [
  { name: "name", type: "string" },
  { name: "version", type: "string" },
  { name: "chainId", type: "uint256" },
  { name: "verifyingContract", type: "address" },
];
const AuthSignature = [{ name: "value", type: "string" }];

const Types = {
  EIP712Domain,
  AuthSignature
}

class Signing {
  static async signAuthenticationMessage(
    account,
    nonce,
    domain
  ) {
    const types = {
      EIP712Domain,
      AuthSignature,
    };
    const message = {
      value: `Authentication message: ${nonce}`,
    };
    const data = {
      domain,
      types,
      message,
      primaryType: "AuthSignature",
    };

    return ethers.utils.splitSignature(
      await signTypedData_v4(account.privateKey, { data })
    );
  }
}

module.exports = { Signing, Types };
