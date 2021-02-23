const ethers = require("ethers");

const ApiError = require("../ApiError");
const paymentTypes = require("../../utils/paymentTypes");

const actors = {
  BUYER: "buyer",
  SELLER: "seller",
  ESCROW: "escrow",
};

class PaymentsController {
  constructor(vouchersRepository, paymentsRepository) {
    this.vouchersRepository = vouchersRepository;
    this.paymentsRepository = paymentsRepository;
  }

  async getPaymentActors(req, res, next) {
    const objectId = req.params.voucherID;
    let userVoucher;

    const distributedAmounts = {
      payment: {
        buyer: ethers.BigNumber.from(0),
        seller: ethers.BigNumber.from(0),
        escrow: ethers.BigNumber.from(0),
      },
      sellerDeposit: {
        buyer: ethers.BigNumber.from(0),
        seller: ethers.BigNumber.from(0),
        escrow: ethers.BigNumber.from(0),
      },
      buyerDeposit: {
        buyer: ethers.BigNumber.from(0),
        seller: ethers.BigNumber.from(0),
        escrow: ethers.BigNumber.from(0),
      },
    };

    try {
      userVoucher = await this.vouchersRepository.getVoucherById(objectId);
      const buyer = userVoucher._holder;

      // TODO this must come from the voucher, not voucher owner as, the voucher
      //      might be transferred and we do not want to update every single
      //     possible userVoucher with the newly owner from that supply
      const seller = userVoucher.voucherOwner;
      const payments = await this.paymentsRepository.getPaymentsByVoucherTokenId(
        userVoucher._tokenIdVoucher
      );

      for (const key in payments) {
        if (payments[key]._to.toLowerCase() === buyer) {
          this.addPayment(payments[key], actors.BUYER, distributedAmounts);
        } else if (payments[key]._to.toLowerCase() === seller) {
          this.addPayment(payments[key], actors.SELLER, distributedAmounts);
        } else {
          this.addPayment(payments[key], actors.ESCROW, distributedAmounts);
        }
      }
    } catch (error) {
      console.error(error);
      return next(
        new ApiError(
          400,
          `Get payment actors for voucher id: ${userVoucher._tokenIdVoucher} could not be completed.`
        )
      );
    }

    res.status(200).send({ distributedAmounts });
  }

  addPayment(paymentDetails, actor, distributedAmounts) {
    if (paymentDetails._type === paymentTypes.PAYMENT) {
      distributedAmounts.payment[actor] = ethers.BigNumber.from(
        distributedAmounts.payment[actor].toString()
      ).add(paymentDetails._payment.toString());
    } else if (paymentDetails._type === paymentTypes.SELLER_DEPOSIT) {
      distributedAmounts.sellerDeposit[actor] = ethers.BigNumber.from(
        distributedAmounts.sellerDeposit[actor].toString()
      ).add(paymentDetails._payment.toString());
    } else if (paymentDetails._type === paymentTypes.BUYER_DEPOSIT) {
      distributedAmounts.buyerDeposit[actor] = ethers.BigNumber.from(
        distributedAmounts.buyerDeposit[actor].toString()
      ).add(paymentDetails._payment.toString());
    }
  }

  async createPayments(req, res, next) {
    const events = req.body;
    let promises = [];

    try {
      for (const key in events) {
        promises.push(this.paymentsRepository.createPayment(events[key]));
      }

      await Promise.all(promises);
    } catch (error) {
      console.error(error);
      return next(
        new ApiError(
          400,
          `Create payment operation for voucher id: ${events[0]._tokenIdVoucher} could not be completed.`
        )
      );
    }

    res.status(200).send({ updated: true });
  }

  async getPaymentsByVoucherID(req, res, next) {
    const tokenIdVoucher = req.params.tokenIdVoucher;

    let payments;

    try {
      payments = await this.paymentsRepository.getPaymentsByVoucherTokenId(
        tokenIdVoucher
      );
    } catch (error) {
      console.error(error);
      return next(
        new ApiError(
          400,
          `Get payment for voucher id: ${tokenIdVoucher} could not be completed.`
        )
      );
    }

    res.status(200).send({ payments });
  }
}

module.exports = PaymentsController;
