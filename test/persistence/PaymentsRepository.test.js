const chai = require("chai");
chai.use(require("chai-as-promised"));

const expect = chai.expect;

const PaymentsRepository = require("../../src/database/Payment/PaymentsRepository");
const Payment = require("../../src/database/models/Payment");

const Random = require("../shared/helpers/Random");
const Database = require("../shared/helpers/Database");

describe("Payments Repository", () => {
  before(async () => {
    await Database.connect();
  });

  afterEach(async () => {
    await Database.truncateCollection(Payment);
  });

  after(async () => {
    await Database.disconnect();
  });

  context("createPayment", () => {
    it("stores the payment when valid", async () => {
      const metadata = Random.paymentMetadata();

      const paymentsRepository = new PaymentsRepository();
      await paymentsRepository.createPayment(metadata);

      const payment = await Payment.findOne({
        _tokenIdVoucher: metadata._tokenIdVoucher,
      });

      expect(payment._tokenIdVoucher).to.eql(metadata._tokenIdVoucher);
      expect(payment._to).to.eql(metadata._to);
      expect(payment._payment.toString()).to.eql(metadata._payment);
      expect(payment._type).to.eql(metadata._type);
      expect(payment.txHash).to.eql(metadata.txHash);
    });

    it("fails when voucher token ID is missing", async () => {
      const metadata = Random.paymentMetadata({
        _tokenIdVoucher: null,
      });

      const paymentsRepository = new PaymentsRepository();

      await expect(
        paymentsRepository.createPayment(metadata)
      ).to.be.rejectedWith(
        "Payment validation failed: _tokenIdVoucher: Path `_tokenIdVoucher` is required."
      );
    });

    it("trims the voucher token ID when including whitespace", async () => {
      const voucherTokenId = Random.uint256();
      const metadata = Random.paymentMetadata({
        _tokenIdVoucher: ` ${voucherTokenId} `,
      });

      const paymentsRepository = new PaymentsRepository();
      await paymentsRepository.createPayment(metadata);

      const payment = await Payment.findOne({
        _tokenIdVoucher: metadata._tokenIdVoucher,
      });

      expect(payment._tokenIdVoucher).to.eql(voucherTokenId);
    });

    it("fails when payment is missing", async () => {
      const metadata = Random.paymentMetadata({
        _payment: null,
      });

      const paymentsRepository = new PaymentsRepository();

      await expect(
        paymentsRepository.createPayment(metadata)
      ).to.be.rejectedWith(
        "Payment validation failed: _payment: Path `_payment` is required."
      );
    });

    it("fails when to is missing", async () => {
      const metadata = Random.paymentMetadata({
        _to: null,
      });

      const paymentsRepository = new PaymentsRepository();

      await expect(
        paymentsRepository.createPayment(metadata)
      ).to.be.rejectedWith(
        "Payment validation failed: _to: Path `_to` is required."
      );
    });

    it("fails when type is missing", async () => {
      const metadata = Random.paymentMetadata({
        _type: null,
      });

      const paymentsRepository = new PaymentsRepository();

      await expect(
        paymentsRepository.createPayment(metadata)
      ).to.be.rejectedWith(
        "Payment validation failed: _type: Path `_type` is required."
      );
    });

    it("trims the type when including whitespace", async () => {
      const type = Random.paymentType();
      const metadata = Random.paymentMetadata({
        _type: ` ${type} `,
      });

      const paymentsRepository = new PaymentsRepository();
      await paymentsRepository.createPayment(metadata);

      const payment = await Payment.findOne({
        _tokenIdVoucher: metadata._tokenIdVoucher,
      });

      expect(payment._type).to.eql(type);
    });

    it("fails when transaction hash is missing", async () => {
      const metadata = Random.paymentMetadata({
        txHash: null,
      });

      const paymentsRepository = new PaymentsRepository();

      await expect(
        paymentsRepository.createPayment(metadata)
      ).to.be.rejectedWith(
        "Payment validation failed: txHash: Path `txHash` is required."
      );
    });
  });

  context("getPaymentsByVoucherTokenId", () => {
    it("finds all payments for the provided voucher token ID", async () => {
      const voucherTokenId = Random.uint256();

      const metadata1 = Random.paymentMetadata({
        _tokenIdVoucher: voucherTokenId,
      });
      const metadata2 = Random.paymentMetadata();
      const metadata3 = Random.paymentMetadata({
        _tokenIdVoucher: voucherTokenId,
      });

      const payment1 = new Payment(metadata1);
      const payment2 = new Payment(metadata2);
      const payment3 = new Payment(metadata3);

      await payment1.save();
      await payment2.save();
      await payment3.save();

      const paymentsRepository = new PaymentsRepository();
      const payments = await paymentsRepository.getPaymentsByVoucherTokenId(
        voucherTokenId
      );

      expect(payments.length).to.eql(2);
      expect(payments[0].toObject()).to.eql(payment1.toObject());
      expect(payments[1].toObject()).to.eql(payment3.toObject());
    });

    it("returns empty list when no payments for voucher token ID", async () => {
      const voucherTokenId = Random.uint256();

      const metadata1 = Random.paymentMetadata();
      const metadata2 = Random.paymentMetadata();

      const payment1 = new Payment(metadata1);
      const payment2 = new Payment(metadata2);

      await payment1.save();
      await payment2.save();

      const paymentsRepository = new PaymentsRepository();
      const payments = await paymentsRepository.getPaymentsByVoucherTokenId(
        voucherTokenId
      );

      expect(payments).to.eql([]);
    });

    it("returns an empty list when there are no payments", async () => {
      const voucherTokenId = Random.uint256();

      const paymentsRepository = new PaymentsRepository();
      const payments = await paymentsRepository.getPaymentsByVoucherTokenId(
        voucherTokenId
      );

      expect(payments).to.eql([]);
    });
  });
});
