const chai = require("chai");
const mongoose = require("mongoose");
chai.use(require("chai-as-promised"));

const expect = chai.expect;

const ConfigurationService = require("../../src/services/ConfigurationService");
const VouchersRepository = require("../../src/database/Voucher/VouchersRepository");
const Voucher = require("../../src/database/models/Voucher");
const statuses = require("../../src/utils/userVoucherStatus");

const Random = require("../shared/helpers/Random");
const Time = require("../shared/helpers/Time");

describe("Vouchers Repository", () => {
  before(async () => {
    const configurationService = new ConfigurationService();
    const databaseConnectionString =
      configurationService.databaseConnectionString ||
      "mongodb://admin:secret@localhost:27017/admin";
    await mongoose.connect(databaseConnectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
  });

  afterEach(async () => {
    await Voucher.collection.deleteMany({});
  });

  after(async () => {
    await mongoose.disconnect();
  });

  context("createVoucher", () => {
    it("stores the voucher when valid", async () => {
      const voucherSupplyId = Random.documentId().toString();
      const metadata = Random.voucherMetadata();

      const vouchersRepository = new VouchersRepository();

      const [before, after] = await Time.boundaries(() =>
        vouchersRepository.createVoucher(metadata, voucherSupplyId)
      );

      const voucher = await Voucher.findOne({
        supplyID: voucherSupplyId,
      });

      expect(voucher.supplyID).to.eql(voucherSupplyId);
      expect(voucher._holder).to.eql(metadata._holder.toLowerCase());
      expect(voucher._tokenIdSupply).to.eql(metadata._tokenIdSupply);
      expect(voucher._tokenIdVoucher).to.eql(metadata._tokenIdVoucher);
      expect(voucher.voucherOwner).to.eql(metadata._issuer.toLowerCase());
      expect(voucher.actionDate.getTime()).to.be.greaterThan(before);
      expect(voucher.actionDate.getTime()).to.be.lessThan(after);
      expect(voucher[statuses.COMMITTED].getTime()).to.be.greaterThan(before);
      expect(voucher[statuses.COMMITTED].getTime()).to.be.lessThan(after);
      expect(voucher[statuses.CANCELLED]).to.be.null;
      expect(voucher[statuses.COMPLAINED]).to.be.null;
      expect(voucher[statuses.REDEEMED]).to.be.null;
      expect(voucher[statuses.REFUNDED]).to.be.null;
      expect(voucher[statuses.FINALIZED]).to.be.null;
    });

    it("fails when voucher supply ID is missing", async () => {
      const voucherSupplyId = undefined;
      const metadata = Random.voucherMetadata();

      const vouchersRepository = new VouchersRepository();

      await expect(
        vouchersRepository.createVoucher(metadata, voucherSupplyId)
      ).to.be.rejectedWith(
        "Validation failed: supplyID: Path `supplyID` is required."
      );
    });

    it("trims the voucher supply ID when including whitespace", async () => {
      const voucherSupplyId = Random.documentId().toString();
      const metadata = Random.voucherMetadata();

      const vouchersRepository = new VouchersRepository();
      await vouchersRepository.createVoucher(metadata, ` ${voucherSupplyId} `);

      const voucher = await Voucher.findOne({
        supplyID: voucherSupplyId,
      });

      expect(voucher.supplyID).to.eql(voucherSupplyId);
    });

    it("fails when supply token ID is missing", async () => {
      const voucherSupplyId = Random.documentId().toString();
      const metadata = Random.voucherMetadata({
        _tokenIdSupply: null,
      });

      const vouchersRepository = new VouchersRepository();

      await expect(
        vouchersRepository.createVoucher(metadata, voucherSupplyId)
      ).to.be.rejectedWith(
        "Validation failed: _tokenIdSupply: Path `_tokenIdSupply` is required."
      );
    });

    it("updates the voucher when it already exists", async () => {
      const voucherSupplyId = Random.documentId().toString();
      const voucherTokenId = Random.uint256();

      const metadata1 = Random.voucherMetadata({
        _tokenIdVoucher: voucherTokenId,
      });
      const metadata2 = Random.voucherMetadata({
        _tokenIdVoucher: voucherTokenId,
      });

      await new Voucher(
        Random.voucherAttributes({
          supplyID: voucherSupplyId,
          ...metadata1,
        })
      ).save();

      const vouchersRepository = new VouchersRepository();
      const [before, after] = await Time.boundaries(() =>
        vouchersRepository.createVoucher(metadata2, voucherSupplyId)
      );

      const voucher = await Voucher.findOne({
        supplyID: voucherSupplyId,
      });

      expect(voucher.supplyID).to.eql(voucherSupplyId);
      expect(voucher._holder).to.eql(metadata2._holder.toLowerCase());
      expect(voucher._tokenIdSupply).to.eql(metadata2._tokenIdSupply);
      expect(voucher._tokenIdVoucher).to.eql(metadata2._tokenIdVoucher);
      expect(voucher.voucherOwner).to.eql(metadata2._issuer.toLowerCase());
      expect(voucher.actionDate.getTime()).to.be.greaterThan(before);
      expect(voucher.actionDate.getTime()).to.be.lessThan(after);
      expect(voucher[statuses.COMMITTED].getTime()).to.be.greaterThan(before);
      expect(voucher[statuses.COMMITTED].getTime()).to.be.lessThan(after);
      expect(voucher[statuses.CANCELLED]).to.be.null;
      expect(voucher[statuses.COMPLAINED]).to.be.null;
      expect(voucher[statuses.REDEEMED]).to.be.null;
      expect(voucher[statuses.REFUNDED]).to.be.null;
      expect(voucher[statuses.FINALIZED]).to.be.null;
    });
  });

  context("updateVoucherStatus", () => {
    Object.values(statuses).forEach((status) => {
      context(` for ${status} status`, () => {
        it(
          `sets the current date on the status on the voucher ` +
          "with the provided voucher ID when it exists",
          async () => {
            const savedVoucher = new Voucher(
              Random.voucherAttributes({
                [statuses.COMMITTED]: Date.now(),
                [statuses.CANCELLED]: null,
                [statuses.COMPLAINED]: null,
                [statuses.REDEEMED]: null,
                [statuses.REFUNDED]: null,
                [statuses.FINALIZED]: null,
              })
            );
            await savedVoucher.save();

            const vouchersRepository = new VouchersRepository();
            const [before, after] = await Time.boundaries(() =>
              vouchersRepository.updateVoucherStatus(savedVoucher._id, status)
            );

            const foundVoucher = await Voucher.findById(savedVoucher._id);

            expect(foundVoucher[status].getTime()).to.be.greaterThan(before);
            expect(foundVoucher[status].getTime()).to.be.lessThan(after);
          }
        );

        it("does nothing when no voucher exists for the provided voucher ID", async () => {
          const vouchersRepository = new VouchersRepository();
          await expect(
            vouchersRepository.updateVoucherStatus(
              Random.documentId().toString(),
              status
            )
          ).to.be.rejectedWith("Voucher not found");
        });
      });
    });
  });

  context("finalizeVoucher", () => {
    Object.values(statuses).forEach((status) => {
      context(` for ${status} status`, () => {
        it(
          `sets the current date on the status on the voucher ` +
          "with the provided voucher token ID when it exists",
          async () => {
            const voucherTokenId = Random.uint256();
            const savedVoucher = new Voucher(
              Random.voucherAttributes({
                _tokenIdVoucher: voucherTokenId,
                [statuses.COMMITTED]: Date.now(),
                [statuses.CANCELLED]: null,
                [statuses.COMPLAINED]: null,
                [statuses.REDEEMED]: null,
                [statuses.REFUNDED]: null,
                [statuses.FINALIZED]: null,
              })
            );
            await savedVoucher.save();

            const vouchersRepository = new VouchersRepository();
            const [before, after] = await Time.boundaries(() =>
              vouchersRepository.finalizeVoucher(voucherTokenId, status)
            );

            const foundVoucher = await Voucher.findById(savedVoucher._id);

            expect(foundVoucher[status].getTime()).to.be.greaterThan(before);
            expect(foundVoucher[status].getTime()).to.be.lessThan(after);
          }
        );

        it("does nothing when no voucher exists for the provided voucher ID", async () => {
          const vouchersRepository = new VouchersRepository();
          await expect(
            vouchersRepository.finalizeVoucher(Random.uint256(), status)
          ).to.be.rejectedWith("Voucher not found");
        });
      });
    });
  });

  context("getAllVouchers", () => {
    it("returns all vouchers in insertion order", async () => {
      const voucherSupplyId1 = Random.documentId().toString();
      const voucherSupplyId2 = Random.documentId().toString();
      const voucherSupplyId3 = Random.documentId().toString();

      const attributes1 = Random.voucherAttributes({
        supplyID: voucherSupplyId1,
        ...Random.voucherMetadata(),
      });
      const attributes2 = Random.voucherAttributes({
        supplyID: voucherSupplyId2,
        ...Random.voucherMetadata(),
      });
      const attributes3 = Random.voucherAttributes({
        supplyID: voucherSupplyId3,
        ...Random.voucherMetadata(),
      });

      await new Voucher(attributes1).save();
      await new Voucher(attributes2).save();
      await new Voucher(attributes3).save();

      const voucher1 = await Voucher.findOne({ supplyID: voucherSupplyId1 });
      const voucher2 = await Voucher.findOne({ supplyID: voucherSupplyId2 });
      const voucher3 = await Voucher.findOne({ supplyID: voucherSupplyId3 });

      const vouchersRepository = new VouchersRepository();
      const allVouchers = await vouchersRepository.getAllVouchers();

      expect(allVouchers.length).to.eql(3);
      expect(allVouchers[0].toObject()).to.eql(voucher1.toObject());
      expect(allVouchers[1].toObject()).to.eql(voucher2.toObject());
      expect(allVouchers[2].toObject()).to.eql(voucher3.toObject());
    });

    it("returns empty list when no vouchers", async () => {
      const vouchersRepository = new VouchersRepository();
      const allVouchers = await vouchersRepository.getAllVouchers();

      expect(allVouchers).to.eql([]);
    });
  });

  context("getAllVouchersByVoucherSupplyIdAndOwner", () => {
    it("returns all vouchers for the voucher supply ID and owner in insertion order", async () => {
      const voucherSupplyId1 = Random.documentId().toString();
      const voucherSupplyId2 = Random.documentId().toString();

      const voucherOwner1 = Random.address().toLowerCase();
      const voucherOwner2 = Random.address().toLowerCase();

      const savedVoucher1 = new Voucher(
        Random.voucherAttributes({
          supplyID: voucherSupplyId1,
          ...Random.voucherMetadata({
            _issuer: voucherOwner1,
          }),
        })
      );
      const savedVoucher2 = new Voucher(
        Random.voucherAttributes({
          supplyID: voucherSupplyId2,
          ...Random.voucherMetadata({
            _issuer: voucherOwner1,
          }),
        })
      );
      const savedVoucher3 = new Voucher(
        Random.voucherAttributes({
          supplyID: voucherSupplyId1,
          ...Random.voucherMetadata({
            _issuer: voucherOwner2,
          }),
        })
      );
      const savedVoucher4 = new Voucher(
        Random.voucherAttributes({
          supplyID: voucherSupplyId2,
          ...Random.voucherMetadata({
            _issuer: voucherOwner2,
          }),
        })
      );
      const savedVoucher5 = new Voucher(
        Random.voucherAttributes({
          supplyID: voucherSupplyId1,
          ...Random.voucherMetadata({
            _issuer: voucherOwner1,
          }),
        })
      );

      await savedVoucher1.save();
      await savedVoucher2.save();
      await savedVoucher3.save();
      await savedVoucher4.save();
      await savedVoucher5.save();

      const foundVoucher1 = await Voucher.findOne({ _id: savedVoucher1._id });
      const foundVoucher5 = await Voucher.findOne({ _id: savedVoucher5._id });

      const vouchersRepository = new VouchersRepository();
      const vouchers = await vouchersRepository.getAllVouchersByVoucherSupplyIdAndOwner(
        voucherSupplyId1,
        voucherOwner1
      );

      expect(vouchers.length).to.eql(2);
      expect(vouchers[0].toObject()).to.eql(foundVoucher1.toObject());
      expect(vouchers[1].toObject()).to.eql(foundVoucher5.toObject());
    });

    it("returns empty list when no vouchers for voucher supply ID", async () => {
      const voucherSupplyId1 = Random.documentId().toString();
      const voucherSupplyId2 = Random.documentId().toString();

      const voucherOwner1 = Random.address().toLowerCase();
      const voucherOwner2 = Random.address().toLowerCase();

      const savedVoucher1 = new Voucher(
        Random.voucherAttributes({
          supplyID: voucherSupplyId2,
          ...Random.voucherMetadata({
            _issuer: voucherOwner1,
          }),
        })
      );
      const savedVoucher2 = new Voucher(
        Random.voucherAttributes({
          supplyID: voucherSupplyId2,
          ...Random.voucherMetadata({
            _issuer: voucherOwner1,
          }),
        })
      );
      const savedVoucher3 = new Voucher(
        Random.voucherAttributes({
          supplyID: voucherSupplyId2,
          ...Random.voucherMetadata({
            _issuer: voucherOwner2,
          }),
        })
      );

      await savedVoucher1.save();
      await savedVoucher2.save();
      await savedVoucher3.save();

      const vouchersRepository = new VouchersRepository();
      const vouchers = await vouchersRepository.getAllVouchersByVoucherSupplyIdAndOwner(
        voucherSupplyId1,
        voucherOwner1
      );

      expect(vouchers).to.eql([]);
    });

    it("returns empty list when no vouchers for owner", async () => {
      const voucherSupplyId1 = Random.documentId().toString();
      const voucherSupplyId2 = Random.documentId().toString();

      const voucherOwner1 = Random.address().toLowerCase();
      const voucherOwner2 = Random.address().toLowerCase();

      const savedVoucher1 = new Voucher(
        Random.voucherAttributes({
          supplyID: voucherSupplyId1,
          ...Random.voucherMetadata({
            _issuer: voucherOwner2,
          }),
        })
      );
      const savedVoucher2 = new Voucher(
        Random.voucherAttributes({
          supplyID: voucherSupplyId1,
          ...Random.voucherMetadata({
            _issuer: voucherOwner2,
          }),
        })
      );
      const savedVoucher3 = new Voucher(
        Random.voucherAttributes({
          supplyID: voucherSupplyId2,
          ...Random.voucherMetadata({
            _issuer: voucherOwner2,
          }),
        })
      );

      await savedVoucher1.save();
      await savedVoucher2.save();
      await savedVoucher3.save();

      const vouchersRepository = new VouchersRepository();
      const vouchers = await vouchersRepository.getAllVouchersByVoucherSupplyIdAndOwner(
        voucherSupplyId1,
        voucherOwner1
      );

      expect(vouchers).to.eql([]);
    });

    it("returns empty list when no vouchers", async () => {
      const voucherSupplyId = Random.documentId().toString();
      const voucherOwner = Random.address().toLowerCase();

      const vouchersRepository = new VouchersRepository();
      const allVouchers = await vouchersRepository.getAllVouchersByVoucherSupplyIdAndOwner(
        voucherSupplyId,
        voucherOwner
      );

      expect(allVouchers).to.eql([]);
    });
  });

  context("getAllVouchersByHolder", () => {
    it("returns all vouchers for the holder ordered by action date descending", async () => {
      const voucherHolder1 = Random.address().toLowerCase();
      const voucherHolder2 = Random.address().toLowerCase();

      const savedVoucher1 = new Voucher(
        Random.voucherAttributes({
          _holder: voucherHolder1,
          actionDate: Date.now() - 10000,
        })
      );
      const savedVoucher2 = new Voucher(
        Random.voucherAttributes({
          _holder: voucherHolder2,
        })
      );
      const savedVoucher3 = new Voucher(
        Random.voucherAttributes({
          _holder: voucherHolder1,
          actionDate: Date.now() - 5000,
        })
      );
      const savedVoucher4 = new Voucher(
        Random.voucherAttributes({
          _holder: voucherHolder2,
        })
      );
      const savedVoucher5 = new Voucher(
        Random.voucherAttributes({
          _holder: voucherHolder1,
          actionDate: Date.now() - 15000,
        })
      );

      await savedVoucher1.save();
      await savedVoucher2.save();
      await savedVoucher3.save();
      await savedVoucher4.save();
      await savedVoucher5.save();

      const foundVoucher1 = await Voucher.findOne({ _id: savedVoucher1._id });
      const foundVoucher3 = await Voucher.findOne({ _id: savedVoucher3._id });
      const foundVoucher5 = await Voucher.findOne({ _id: savedVoucher5._id });

      const vouchersRepository = new VouchersRepository();
      const vouchers = await vouchersRepository.getAllVouchersByHolder(
        voucherHolder1
      );

      expect(vouchers.length).to.eql(3);
      expect(vouchers[0].toObject()).to.eql(foundVoucher3.toObject());
      expect(vouchers[1].toObject()).to.eql(foundVoucher1.toObject());
      expect(vouchers[2].toObject()).to.eql(foundVoucher5.toObject());
    });

    it("returns empty list when no vouchers for holder", async () => {
      const voucherHolder1 = Random.address().toLowerCase();
      const voucherHolder2 = Random.address().toLowerCase();

      const savedVoucher1 = new Voucher(
        Random.voucherAttributes({
          _holder: voucherHolder2,
        })
      );
      const savedVoucher2 = new Voucher(
        Random.voucherAttributes({
          _holder: voucherHolder2,
        })
      );
      const savedVoucher3 = new Voucher(
        Random.voucherAttributes({
          _holder: voucherHolder2,
        })
      );

      await savedVoucher1.save();
      await savedVoucher2.save();
      await savedVoucher3.save();

      const vouchersRepository = new VouchersRepository();
      const vouchers = await vouchersRepository.getAllVouchersByHolder(
        voucherHolder1
      );

      expect(vouchers).to.eql([]);
    });

    it("returns empty list when no vouchers", async () => {
      const voucherHolder = Random.address().toLowerCase();

      const vouchersRepository = new VouchersRepository();
      const allVouchers = await vouchersRepository.getAllVouchersByHolder(
        voucherHolder
      );

      expect(allVouchers).to.eql([]);
    });
  });

  context("getVoucherById", () => {
    it("returns the voucher with the provided ID when it exists", async () => {
      const savedVoucher = new Voucher(Random.voucherAttributes());

      await savedVoucher.save();

      const vouchersRepository = new VouchersRepository();
      const foundVoucher = await vouchersRepository.getVoucherById(
        savedVoucher._id
      );

      expect(foundVoucher.toObject()).to.eql(savedVoucher.toObject());
    });

    it("returns null when no voucher with the provided ID", async () => {
      const vouchersRepository = new VouchersRepository();
      const foundVoucher = await vouchersRepository.getVoucherById(
        Random.documentId().toString()
      );

      expect(foundVoucher).to.be.null;
    });
  });

  context("getVoucherByVoucherTokenId", () => {
    it("returns the voucher with the provided voucher token ID when it exists", async () => {
      const voucherTokenId = Random.uint256();
      const savedVoucher = new Voucher(
        Random.voucherAttributes({
          _tokenIdVoucher: voucherTokenId,
        })
      );
      await savedVoucher.save();

      const vouchersRepository = new VouchersRepository();
      const foundVoucher = await vouchersRepository.getVoucherByVoucherTokenId(
        voucherTokenId
      );

      expect(foundVoucher.toObject()).to.eql(savedVoucher.toObject());
    });

    it("returns null when no voucher with the provided voucher token ID", async () => {
      const vouchersRepository = new VouchersRepository();
      const foundVoucher = await vouchersRepository.getVoucherByVoucherTokenId(
        Random.uint256()
      );

      expect(foundVoucher).to.be.null;
    });
  });
});
