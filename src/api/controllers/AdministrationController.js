const ethers = require("ethers");

const ApiError = require("../ApiError");
const userRoles = require('../../database/User/userRoles')

class AdministrationController {
  constructor(authenticationService, usersRepository, voucherSuppliesRepository) {
    this.authenticationService = authenticationService
    this.usersRepository = usersRepository;
    this.voucherSuppliesRepository = voucherSuppliesRepository;
  }

  async logInSuperadmin(req, res) {
    const username = req.auth.user;
    const role = userRoles.ADMIN;
    const fiveMinutesInSeconds = 300

    const authToken = this.authenticationService.generateToken({
      address: username,
      role
    }, fiveMinutesInSeconds);

    res.status(201).send(authToken)
  }

  async makeAdmin(req, res, next) {
    const address = req.params.address.toLowerCase();

    if (!ethers.utils.isAddress(address)) {
      return next(
        new ApiError(
          400,
          `Provided address: ${address} is not a valid ETH address!`
        )
      );
    }

    try {
      const user = await this.usersRepository.getUser(address);

      if (!user) {
        return next(
          new ApiError(400, `Provided user does not exist in the DB!`)
        );
      }

      await this.usersRepository.setUserToAdmin(address);
    } catch (error) {
      console.error(error);
      return next(
        new ApiError(400, `Provided address: ${address} was not set as admin!`)
      );
    }

    res.status(200).send({ updated: true });
  }

  async changeVoucherSupplyVisibility(req, res, next) {
    const supplyID = req.params.supplyID;
    let voucherSupply;
    let updatedVoucherSupply;

    try {
      voucherSupply = await this.voucherSuppliesRepository.getVoucherSupplyById(
        supplyID
      );
      updatedVoucherSupply = await this.voucherSuppliesRepository.toggleVoucherSupplyVisibility(
        voucherSupply.id
      );
    } catch (error) {
      console.error(error);
      return next(
        new ApiError(400, `Voucher with ID: ${supplyID} does not exist!`)
      );
    }

    res.status(200).send({ visible: updatedVoucherSupply.visible });
  }
}

module.exports = AdministrationController;
