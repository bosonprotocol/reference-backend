const ethers = require("ethers");
const ApiError = require("../api-error");
const mongooseService = require("../../database/index.js");
const UsersRepository = require("../../database/User/users-repository");

const usersRepository = new UsersRepository();

class AdminController {
  static async changeVoucherSupplyVisibility(req, res, next) {
    const supplyID = req.params.supplyID;
    let voucherSupply;
    let updatedVoucherSupply;

    try {
      voucherSupply = await mongooseService.getVoucherSupply(supplyID);
      updatedVoucherSupply = await mongooseService.updateVoucherVisibilityStatus(
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

  static async makeAdmin(req, res, next) {
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
      const user = await usersRepository.getUser(address);

      if (!user) {
        return next(
          new ApiError(400, `Provided user does not exist in the DB!`)
        );
      }

      await usersRepository.setUserToAdmin(address);
    } catch (error) {
      console.error(error);
      return next(
        new ApiError(400, `Provided address: ${address} was not set as admin!`)
      );
    }

    res.status(200).send({ updated: true });
  }
}

module.exports = AdminController;
