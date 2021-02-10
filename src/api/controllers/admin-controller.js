const ethers = require("ethers");
const ApiError = require("../api-error");
const UsersRepository = require("../../database/User/users-repository");
const VoucherSuppliesRepository = require("../../database/VoucherSupply/voucher-supplies-repository");

const usersRepository = new UsersRepository();
const voucherSuppliesRepository = new VoucherSuppliesRepository();

class AdminController {
  static async changeVoucherSupplyVisibility(req, res, next) {
    const supplyID = req.params.supplyID;
    let voucherSupply;

    try {
      voucherSupply = await voucherSuppliesRepository.getVoucherSupplyById(
        supplyID
      );
    } catch (error) {
      console.error(error);
      return next(
        new ApiError(400, `Voucher with ID: ${supplyID} does not exist!`)
      );
    }

    const updatedVoucherSupply = await voucherSuppliesRepository.toggleVoucherSupplyVisibility(
      voucherSupply.id
    );
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
