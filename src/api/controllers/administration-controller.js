const ethers = require("ethers");
const ApiError = require("../api-error");

class AdministrationController {
  constructor(usersRepository, voucherSuppliesRepository) {
    this.usersRepository = usersRepository;
    this.voucherSuppliesRepository = voucherSuppliesRepository;
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
}

module.exports = AdministrationController;
