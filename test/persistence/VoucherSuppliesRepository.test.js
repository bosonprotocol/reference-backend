const chai = require("chai");
chai.use(require("chai-as-promised"));
const { validate: uuidValidate } = require("uuid");

const expect = chai.expect;

const VoucherSuppliesRepository = require("../../src/database/VoucherSupply/VoucherSuppliesRepository");
const VoucherSupply = require("../../src/database/models/VoucherSupply");
const Voucher = require("../../src/database/models/Voucher");
const voucherStatuses = require("../../src/utils/voucherStatuses");

const Random = require("../shared/helpers/Random");
const Database = require("../shared/helpers/Database");

describe("Voucher Supplies Repository", () => {
  before(async () => {
    await Database.connect();
  });

  afterEach(async () => {
    await Database.truncateCollection(VoucherSupply);
  });

  after(async () => {
    await Database.disconnect();
  });

  context("createVoucherSupply", () => {
    it("stores the voucher supply when valid", async () => {
      const uuidv4RegEx = /\/([0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12})\//;
      const uuidExtractor = new RegExp(uuidv4RegEx);

      const voucherOwner = Random.address();
      const fileRef1 = Random.fileRef();
      const fileRef2 = Random.fileRef();
      const fileRefs = [fileRef1, fileRef2];
      const metadata = Random.voucherSupplyMetadata();

      const voucherSuppliesRepository = new VoucherSuppliesRepository();
      await voucherSuppliesRepository.createVoucherSupply(
        metadata,
        fileRefs,
        voucherOwner
      );

      const voucherSupply = await VoucherSupply.findOne({
        voucherOwner,
      });

      expect(voucherSupply.voucherOwner).to.eql(voucherOwner);
      expect(voucherSupply.title).to.eql(metadata.title);
      expect(voucherSupply.qty).to.eql(metadata.qty);
      expect(voucherSupply.category).to.eql(metadata.category);
      expect(voucherSupply.startDate).to.eql(new Date(metadata.startDate));
      expect(voucherSupply.offeredDate).to.eql(new Date(metadata.offeredDate));
      expect(voucherSupply.expiryDate).to.eql(new Date(metadata.expiryDate));
      expect(voucherSupply.price.toString()).to.eql(metadata.price);
      expect(voucherSupply.buyerDeposit.toString()).to.eql(
        metadata.buyerDeposit
      );
      expect(voucherSupply.sellerDeposit.toString()).to.eql(
        metadata.sellerDeposit
      );
      expect(voucherSupply.description).to.eql(metadata.description);
      expect(voucherSupply.location).to.eql(metadata.location);
      expect(voucherSupply.contact).to.eql(metadata.contact);
      expect(voucherSupply.conditions).to.eql(metadata.conditions);
      expect(voucherSupply._tokenIdSupply).to.eql(metadata._tokenIdSupply);
      expect(voucherSupply.visible).to.be.true;
      expect(voucherSupply.imagefiles).to.eql(fileRefs);

      fileRefs.forEach((ref) => {
        const uuid = uuidExtractor.exec(ref.url)[1];
        expect(uuidValidate(uuid)).to.be.true;
      });
    });

    it("fails when title is missing", async () => {
      const voucherOwner = Random.address();
      const fileRef1 = Random.fileRef();
      const fileRef2 = Random.fileRef();
      const fileRefs = [fileRef1, fileRef2];
      const metadata = Random.voucherSupplyMetadata({
        title: null,
      });

      const voucherSuppliesRepository = new VoucherSuppliesRepository();

      await expect(
        voucherSuppliesRepository.createVoucherSupply(
          metadata,
          fileRefs,
          voucherOwner
        )
      ).to.be.rejectedWith(
        "VoucherSupply validation failed: title: Path `title` is required."
      );
    });

    it("trims the title when including whitespace", async () => {
      const voucherOwner = Random.address();
      const fileRef1 = Random.fileRef();
      const fileRef2 = Random.fileRef();
      const fileRefs = [fileRef1, fileRef2];
      const metadata = Random.voucherSupplyMetadata({
        title: " some title ",
      });

      const voucherSuppliesRepository = new VoucherSuppliesRepository();

      await voucherSuppliesRepository.createVoucherSupply(
        metadata,
        fileRefs,
        voucherOwner
      );

      const voucherSupply = await VoucherSupply.findOne({
        voucherOwner,
      });

      expect(voucherSupply.title).to.eql("some title");
    });

    it("fails when quantity is missing", async () => {
      const voucherOwner = Random.address();
      const fileRef1 = Random.fileRef();
      const fileRef2 = Random.fileRef();
      const fileRefs = [fileRef1, fileRef2];
      const metadata = Random.voucherSupplyMetadata({
        qty: null,
      });

      const voucherSuppliesRepository = new VoucherSuppliesRepository();

      await expect(
        voucherSuppliesRepository.createVoucherSupply(
          metadata,
          fileRefs,
          voucherOwner
        )
      ).to.be.rejectedWith(
        "VoucherSupply validation failed: qty: Path `qty` is required."
      );
    });

    it("fails when quantity is negative", async () => {
      const voucherOwner = Random.address();
      const fileRef1 = Random.fileRef();
      const fileRef2 = Random.fileRef();
      const fileRefs = [fileRef1, fileRef2];
      const metadata = Random.voucherSupplyMetadata({
        qty: -15,
      });

      const voucherSuppliesRepository = new VoucherSuppliesRepository();

      await expect(
        voucherSuppliesRepository.createVoucherSupply(
          metadata,
          fileRefs,
          voucherOwner
        )
      ).to.be.rejectedWith(
        "VoucherSupply validation failed: qty: Qty must be a positive number"
      );
    });

    it("fails when quantity is not a number", async () => {
      const voucherOwner = Random.address();
      const fileRef1 = Random.fileRef();
      const fileRef2 = Random.fileRef();
      const fileRefs = [fileRef1, fileRef2];
      const metadata = Random.voucherSupplyMetadata({
        qty: "not-a-number",
      });

      const voucherSuppliesRepository = new VoucherSuppliesRepository();

      await expect(
        voucherSuppliesRepository.createVoucherSupply(
          metadata,
          fileRefs,
          voucherOwner
        )
      ).to.be.rejectedWith(
        'VoucherSupply validation failed: qty: Cast to Number failed for value "not-a-number" at path "qty"'
      );
    });

    it("fails when price is missing", async () => {
      const voucherOwner = Random.address();
      const fileRef1 = Random.fileRef();
      const fileRef2 = Random.fileRef();
      const fileRefs = [fileRef1, fileRef2];
      const metadata = Random.voucherSupplyMetadata({
        price: null,
      });

      const voucherSuppliesRepository = new VoucherSuppliesRepository();

      await expect(
        voucherSuppliesRepository.createVoucherSupply(
          metadata,
          fileRefs,
          voucherOwner
        )
      ).to.be.rejectedWith(
        "VoucherSupply validation failed: price: Path `price` is required."
      );
    });

    it("fails when buyer deposit is missing", async () => {
      const voucherOwner = Random.address();
      const fileRef1 = Random.fileRef();
      const fileRef2 = Random.fileRef();
      const fileRefs = [fileRef1, fileRef2];
      const metadata = Random.voucherSupplyMetadata({
        buyerDeposit: null,
      });

      const voucherSuppliesRepository = new VoucherSuppliesRepository();

      await expect(
        voucherSuppliesRepository.createVoucherSupply(
          metadata,
          fileRefs,
          voucherOwner
        )
      ).to.be.rejectedWith(
        "VoucherSupply validation failed: buyerDeposit: Path `buyerDeposit` is required."
      );
    });

    it("fails when seller deposit is missing", async () => {
      const voucherOwner = Random.address();
      const fileRef1 = Random.fileRef();
      const fileRef2 = Random.fileRef();
      const fileRefs = [fileRef1, fileRef2];
      const metadata = Random.voucherSupplyMetadata({
        sellerDeposit: null,
      });

      const voucherSuppliesRepository = new VoucherSuppliesRepository();

      await expect(
        voucherSuppliesRepository.createVoucherSupply(
          metadata,
          fileRefs,
          voucherOwner
        )
      ).to.be.rejectedWith(
        "VoucherSupply validation failed: sellerDeposit: Path `sellerDeposit` is required."
      );
    });
  });

  // TODO: test validations on update
  context("updateVoucherSupply", () => {
    it("updates the voucher supply metadata except token supply ID when valid", async () => {
      const voucherOwner = Random.address();
      const fileRef1 = Random.fileRef();
      const fileRef2 = Random.fileRef();
      const fileRefs = [fileRef1, fileRef2];

      const metadata1 = Random.voucherSupplyMetadata();
      const metadata2 = Random.voucherSupplyMetadata();

      await new VoucherSupply({
        ...metadata1,
        voucherOwner: voucherOwner,
        imagefiles: fileRefs,
        visible: true,
      }).save();

      const initialVoucherSupply = await VoucherSupply.findOne({
        voucherOwner,
      });

      const voucherSuppliesRepository = new VoucherSuppliesRepository();
      await voucherSuppliesRepository.updateVoucherSupply(
        initialVoucherSupply,
        metadata2,
        []
      );

      const updatedVoucherSupply = await VoucherSupply.findOne({
        voucherOwner,
      });

      expect(updatedVoucherSupply.voucherOwner).to.eql(voucherOwner);
      expect(updatedVoucherSupply.title).to.eql(metadata2.title);
      expect(updatedVoucherSupply.qty).to.eql(metadata2.qty);
      expect(updatedVoucherSupply.category).to.eql(metadata2.category);
      expect(updatedVoucherSupply.startDate).to.eql(
        new Date(metadata2.startDate)
      );
      expect(updatedVoucherSupply.offeredDate).to.eql(
        new Date(metadata2.offeredDate)
      );
      expect(updatedVoucherSupply.expiryDate).to.eql(
        new Date(metadata2.expiryDate)
      );
      expect(updatedVoucherSupply.price.toString()).to.eql(metadata2.price);
      expect(updatedVoucherSupply.buyerDeposit.toString()).to.eql(
        metadata2.buyerDeposit
      );
      expect(updatedVoucherSupply.sellerDeposit.toString()).to.eql(
        metadata2.sellerDeposit
      );
      expect(updatedVoucherSupply.description).to.eql(metadata2.description);
      expect(updatedVoucherSupply.location).to.eql(metadata2.location);
      expect(updatedVoucherSupply.contact).to.eql(metadata2.contact);
      expect(updatedVoucherSupply.conditions).to.eql(metadata2.conditions);

      expect(updatedVoucherSupply.visible).to.be.true;
      expect(updatedVoucherSupply.imagefiles).to.eql(fileRefs);

      expect(updatedVoucherSupply._tokenIdSupply).to.eql(
        metadata1._tokenIdSupply
      );
    });

    it("appends additional image files to the existing image files", async () => {
      const voucherOwner = Random.address();
      const fileRef1 = Random.fileRef();
      const fileRef2 = Random.fileRef();
      const fileRef3 = Random.fileRef();
      const fileRefs1 = [fileRef1, fileRef2];
      const fileRefs2 = [fileRef3];

      const metadata1 = Random.voucherSupplyMetadata();

      await new VoucherSupply({
        ...metadata1,
        voucherOwner: voucherOwner,
        imagefiles: fileRefs1,
        visible: true,
      }).save();

      const initialVoucherSupply = await VoucherSupply.findOne({
        voucherOwner,
      });

      const voucherSuppliesRepository = new VoucherSuppliesRepository();
      await voucherSuppliesRepository.updateVoucherSupply(
        initialVoucherSupply,
        metadata1,
        fileRefs2
      );

      const updatedVoucherSupply = await VoucherSupply.findOne({
        voucherOwner,
      });

      expect(updatedVoucherSupply.imagefiles).to.eql([
        ...fileRefs1,
        ...fileRefs2,
      ]);
    });

    it("creates the voucher supply when it doesn't exist", async () => {
      const voucherOwner = Random.address();
      const fileRef1 = Random.fileRef();
      const fileRef2 = Random.fileRef();
      const fileRefs = [fileRef1, fileRef2];

      const metadata = Random.voucherSupplyMetadata();

      const initialVoucherSupply = new VoucherSupply({
        ...metadata,
        voucherOwner: voucherOwner,
        imagefiles: fileRefs,
        visible: true,
      });

      const voucherSuppliesRepository = new VoucherSuppliesRepository();
      await voucherSuppliesRepository.updateVoucherSupply(
        initialVoucherSupply,
        metadata,
        []
      );

      const updatedVoucherSupply = await VoucherSupply.findOne({
        voucherOwner,
      });

      expect(updatedVoucherSupply.voucherOwner).to.eql(voucherOwner);
      expect(updatedVoucherSupply.title).to.eql(metadata.title);
      expect(updatedVoucherSupply.qty).to.eql(metadata.qty);
      expect(updatedVoucherSupply.category).to.eql(metadata.category);
      expect(updatedVoucherSupply.startDate).to.eql(
        new Date(metadata.startDate)
      );
      expect(updatedVoucherSupply.offeredDate).to.eql(
        new Date(metadata.offeredDate)
      );
      expect(updatedVoucherSupply.expiryDate).to.eql(
        new Date(metadata.expiryDate)
      );
      expect(updatedVoucherSupply.price.toString()).to.eql(metadata.price);
      expect(updatedVoucherSupply.buyerDeposit.toString()).to.eql(
        metadata.buyerDeposit
      );
      expect(updatedVoucherSupply.sellerDeposit.toString()).to.eql(
        metadata.sellerDeposit
      );
      expect(updatedVoucherSupply.description).to.eql(metadata.description);
      expect(updatedVoucherSupply.location).to.eql(metadata.location);
      expect(updatedVoucherSupply.contact).to.eql(metadata.contact);
      expect(updatedVoucherSupply.conditions).to.eql(metadata.conditions);

      expect(updatedVoucherSupply.visible).to.be.true;
      expect(updatedVoucherSupply.imagefiles).to.eql(fileRefs);

      expect(updatedVoucherSupply._tokenIdSupply).to.eql(
        metadata._tokenIdSupply
      );
    });
  });

  context("decrementVoucherSupplyQuantity", () => {
    it("reduces the quantity of the voucher supply by 1 when it exists", async () => {
      const voucherOwner = Random.address();
      const fileRefs = [Random.fileRef(), Random.fileRef()];
      const metadata = Random.voucherSupplyMetadata();

      await new VoucherSupply({
        ...metadata,
        voucherOwner: voucherOwner,
        imagefiles: fileRefs,
        visible: true,
      }).save();

      const initialVoucherSupply = await VoucherSupply.findOne({
        voucherOwner,
      });

      const voucherSuppliesRepository = new VoucherSuppliesRepository();
      await voucherSuppliesRepository.decrementVoucherSupplyQty(
        initialVoucherSupply._id
      );

      const updatedVoucherSupply = await VoucherSupply.findOne({
        voucherOwner,
      });

      expect(updatedVoucherSupply.qty).to.eql(initialVoucherSupply.qty - 1);
    });

    it("throws an error when the voucher supply does not exist", async () => {
      const voucherOwner = Random.address();
      const fileRefs = [Random.fileRef(), Random.fileRef()];
      const metadata = Random.voucherSupplyMetadata();

      const voucherSupply = new VoucherSupply({
        ...metadata,
        voucherOwner: voucherOwner,
        imagefiles: fileRefs,
        visible: true,
      });

      const voucherSuppliesRepository = new VoucherSuppliesRepository();

      await expect(
        voucherSuppliesRepository.decrementVoucherSupplyQty(voucherSupply._id)
      ).to.be.rejectedWith("Voucher supply not found");
    });

    // TODO: not sure if this is behaviour we want
    it("allows the quantity to be decremented below zero", async () => {
      const voucherOwner = Random.address();
      const fileRefs = [Random.fileRef(), Random.fileRef()];
      const metadata = Random.voucherSupplyMetadata({ qty: 1 });

      await new VoucherSupply({
        ...metadata,
        voucherOwner: voucherOwner,
        imagefiles: fileRefs,
        visible: true,
      }).save();

      const initialVoucherSupply = await VoucherSupply.findOne({
        voucherOwner,
      });

      const voucherSuppliesRepository = new VoucherSuppliesRepository();
      await voucherSuppliesRepository.decrementVoucherSupplyQty(
        initialVoucherSupply._id
      );
      await voucherSuppliesRepository.decrementVoucherSupplyQty(
        initialVoucherSupply._id
      );

      const updatedVoucherSupply = await VoucherSupply.findOne({
        voucherOwner,
      });

      expect(updatedVoucherSupply.qty).to.eql(-1);
    });
  });

  context("toggleVoucherSupplyVisibility", () => {
    it("toggles the visibility of the voucher supply from true to false when it exists and is visible", async () => {
      const voucherOwner = Random.address();
      const fileRefs = [Random.fileRef(), Random.fileRef()];
      const metadata = Random.voucherSupplyMetadata();

      await new VoucherSupply({
        ...metadata,
        voucherOwner: voucherOwner,
        imagefiles: fileRefs,
        visible: true,
      }).save();

      const initialVoucherSupply = await VoucherSupply.findOne({
        voucherOwner,
      });

      const voucherSuppliesRepository = new VoucherSuppliesRepository();
      await voucherSuppliesRepository.toggleVoucherSupplyVisibility(
        initialVoucherSupply._id
      );

      const updatedVoucherSupply = await VoucherSupply.findOne({
        voucherOwner,
      });

      expect(updatedVoucherSupply.visible).to.eql(false);
    });

    it("toggles the visibility of the voucher supply from false to true when it exists and is not visible", async () => {
      const voucherOwner = Random.address();
      const fileRefs = [Random.fileRef(), Random.fileRef()];
      const metadata = Random.voucherSupplyMetadata();

      await new VoucherSupply({
        ...metadata,
        voucherOwner: voucherOwner,
        imagefiles: fileRefs,
        visible: false,
      }).save();

      const initialVoucherSupply = await VoucherSupply.findOne({
        voucherOwner,
      });

      const voucherSuppliesRepository = new VoucherSuppliesRepository();
      await voucherSuppliesRepository.toggleVoucherSupplyVisibility(
        initialVoucherSupply._id
      );

      const updatedVoucherSupply = await VoucherSupply.findOne({
        voucherOwner,
      });

      expect(updatedVoucherSupply.visible).to.eql(true);
    });

    it("throws an error when the voucher supply does not exist", async () => {
      const voucherOwner = Random.address();
      const fileRefs = [Random.fileRef(), Random.fileRef()];
      const metadata = Random.voucherSupplyMetadata();

      const voucherSupply = new VoucherSupply({
        ...metadata,
        voucherOwner: voucherOwner,
        imagefiles: fileRefs,
        visible: true,
      });

      const voucherSuppliesRepository = new VoucherSuppliesRepository();

      await expect(
        voucherSuppliesRepository.toggleVoucherSupplyVisibility(
          voucherSupply._id
        )
      ).to.be.rejectedWith("Voucher supply not found");
    });
  });

  context("deleteVoucherSupply", () => {
    it("deletes the voucher supply when it exists", async () => {
      const voucherOwner = Random.address();
      const fileRefs = [Random.fileRef(), Random.fileRef()];
      const metadata = Random.voucherSupplyMetadata();

      await new VoucherSupply({
        ...metadata,
        voucherOwner: voucherOwner,
        imagefiles: fileRefs,
        visible: true,
      }).save();

      const initialVoucherSupply = await VoucherSupply.findOne({
        voucherOwner,
      });

      const voucherSuppliesRepository = new VoucherSuppliesRepository();
      await voucherSuppliesRepository.deleteVoucherSupply(
        initialVoucherSupply._id
      );

      const updatedVoucherSupply = await VoucherSupply.findOne({
        _id: initialVoucherSupply._id,
      });

      expect(updatedVoucherSupply).to.be.null;
    });

    it("throws an error when the voucher supply does not exist", async () => {
      const voucherOwner = Random.address();
      const fileRefs = [Random.fileRef(), Random.fileRef()];
      const metadata = Random.voucherSupplyMetadata();

      const voucherSupply = new VoucherSupply({
        ...metadata,
        voucherOwner: voucherOwner,
        imagefiles: fileRefs,
        visible: true,
      });

      const voucherSuppliesRepository = new VoucherSuppliesRepository();

      await expect(
        voucherSuppliesRepository.deleteVoucherSupply(voucherSupply._id)
      ).to.be.rejectedWith("Voucher supply not found");
    });
  });

  context("deleteVoucherSupplyImage", () => {
    it("removes the image file from the voucher supply when it exists", async () => {
      const voucherOwner = Random.address();
      const fileRef1 = Random.fileRef();
      const fileRef2 = Random.fileRef();
      const fileRefs = [fileRef1, fileRef2];
      const metadata = Random.voucherSupplyMetadata();

      await new VoucherSupply({
        ...metadata,
        voucherOwner: voucherOwner,
        imagefiles: fileRefs,
        visible: true,
      }).save();

      const initialVoucherSupply = await VoucherSupply.findOne({
        voucherOwner,
      });

      const voucherSuppliesRepository = new VoucherSuppliesRepository();
      await voucherSuppliesRepository.deleteVoucherSupplyImage(
        initialVoucherSupply._id,
        fileRef1.url
      );

      const updatedVoucherSupply = await VoucherSupply.findOne({
        _id: initialVoucherSupply._id,
      });

      expect(updatedVoucherSupply.imagefiles).to.eql([fileRef2]);
    });

    it("does nothing when the image file is not present on the voucher supply", async () => {
      const voucherOwner = Random.address();
      const fileRef1 = Random.fileRef();
      const fileRef2 = Random.fileRef();
      const fileRef3 = Random.fileRef();
      const fileRefs = [fileRef1, fileRef2];
      const metadata = Random.voucherSupplyMetadata();

      await new VoucherSupply({
        ...metadata,
        voucherOwner: voucherOwner,
        imagefiles: fileRefs,
        visible: true,
      }).save();

      const initialVoucherSupply = await VoucherSupply.findOne({
        voucherOwner,
      });

      const voucherSuppliesRepository = new VoucherSuppliesRepository();
      await voucherSuppliesRepository.deleteVoucherSupplyImage(
        initialVoucherSupply._id,
        fileRef3.url
      );

      const updatedVoucherSupply = await VoucherSupply.findOne({
        _id: initialVoucherSupply._id,
      });

      expect(updatedVoucherSupply.imagefiles).to.eql([fileRef1, fileRef2]);
    });

    it("throws an error when the voucher supply does not exist", async () => {
      const voucherOwner = Random.address();
      const fileRef1 = Random.fileRef();
      const fileRef2 = Random.fileRef();
      const fileRefs = [fileRef1, fileRef2];
      const metadata = Random.voucherSupplyMetadata();

      const voucherSupply = new VoucherSupply({
        ...metadata,
        voucherOwner: voucherOwner,
        imagefiles: fileRefs,
        visible: true,
      });

      const voucherSuppliesRepository = new VoucherSuppliesRepository();

      await expect(
        voucherSuppliesRepository.deleteVoucherSupplyImage(
          voucherSupply._id,
          fileRef2.url
        )
      ).to.be.rejectedWith("Voucher supply not found");
    });
  });

  context("getVoucherSupplyById", () => {
    it("returns the voucher supply when it exists", async () => {
      const voucherOwner = Random.address();
      const fileRefs = [Random.fileRef(), Random.fileRef()];
      const metadata = Random.voucherSupplyMetadata();

      await new VoucherSupply({
        ...metadata,
        voucherOwner: voucherOwner,
        imagefiles: fileRefs,
        visible: true,
      }).save();

      const savedVoucherSupply = await VoucherSupply.findOne({
        voucherOwner,
      });

      const voucherSuppliesRepository = new VoucherSuppliesRepository();
      const foundVoucherSupply = await voucherSuppliesRepository.getVoucherSupplyById(
        savedVoucherSupply._id
      );

      expect(foundVoucherSupply).to.eql(savedVoucherSupply);
    });

    it("returns null when the voucher supply does not exist", async () => {
      const voucherOwner = Random.address();
      const fileRefs = [Random.fileRef(), Random.fileRef()];
      const metadata = Random.voucherSupplyMetadata();

      const voucherSupply = new VoucherSupply({
        ...metadata,
        voucherOwner: voucherOwner,
        imagefiles: fileRefs,
        visible: true,
      });

      const voucherSuppliesRepository = new VoucherSuppliesRepository();
      const foundVoucherSupply = await voucherSuppliesRepository.getVoucherSupplyById(
        voucherSupply._id
      );

      expect(foundVoucherSupply).to.be.null;
    });
  });

  context("getVoucherSupplyBySupplyTokenId", () => {
    it("returns the voucher supply for the supply token ID when it exists", async () => {
      const voucherOwner = Random.address();
      const fileRefs = [Random.fileRef(), Random.fileRef()];
      const metadata = Random.voucherSupplyMetadata();

      await new VoucherSupply({
        ...metadata,
        voucherOwner,
        imagefiles: fileRefs,
        visible: true,
      }).save();

      const savedVoucherSupply = await VoucherSupply.findOne({
        voucherOwner,
      });

      const voucherSuppliesRepository = new VoucherSuppliesRepository();
      const foundVoucherSupply = await voucherSuppliesRepository.getVoucherSupplyBySupplyTokenId(
        metadata._tokenIdSupply
      );

      expect(foundVoucherSupply.toObject()).to.eql(
        savedVoucherSupply.toObject()
      );
    });

    it("returns null when no voucher supply exists for the supply token ID", async () => {
      const _tokenIdSupply = Random.uint256();

      const voucherSuppliesRepository = new VoucherSuppliesRepository();
      const foundVoucherSupply = await voucherSuppliesRepository.getVoucherSupplyBySupplyTokenId(
        _tokenIdSupply
      );

      expect(foundVoucherSupply).to.be.null;
    });
  });

  context("getAllVoucherSupplies", () => {
    it("returns all vouchers sets when many exist", async () => {
      const voucherOwner1 = Random.address();
      const fileRefs1 = [Random.fileRef(), Random.fileRef()];
      const metadata1 = Random.voucherSupplyMetadata();

      const voucherOwner2 = Random.address();
      const fileRefs2 = [Random.fileRef(), Random.fileRef()];
      const metadata2 = Random.voucherSupplyMetadata();

      await new VoucherSupply({
        ...metadata1,
        voucherOwner: voucherOwner1,
        imagefiles: fileRefs1,
        visible: true,
      }).save();

      await new VoucherSupply({
        ...metadata2,
        voucherOwner: voucherOwner2,
        imagefiles: fileRefs2,
        visible: true,
      }).save();

      const firstSavedVoucherSupply = await VoucherSupply.findOne({
        voucherOwner: voucherOwner1,
      });
      const secondSavedVoucherSupply = await VoucherSupply.findOne({
        voucherOwner: voucherOwner2,
      });

      const voucherSuppliesRepository = new VoucherSuppliesRepository();
      const voucherSupplies = await voucherSuppliesRepository.getAllVoucherSupplies();

      expect(voucherSupplies.length).to.eql(2);

      const firstFoundVoucherSupply = voucherSupplies[0];
      const secondFoundVoucherSupply = voucherSupplies[1];

      expect(firstFoundVoucherSupply.toObject()).to.eql(
        firstSavedVoucherSupply.toObject()
      );
      expect(secondFoundVoucherSupply.toObject()).to.eql(
        secondSavedVoucherSupply.toObject()
      );
    });

    it("returns single vouchers set when only one exists", async () => {
      const voucherOwner = Random.address();
      const fileRefs = [Random.fileRef(), Random.fileRef()];
      const metadata = Random.voucherSupplyMetadata();

      await new VoucherSupply({
        ...metadata,
        voucherOwner,
        imagefiles: fileRefs,
        visible: true,
      }).save();

      const savedVoucherSupply = await VoucherSupply.findOne({
        voucherOwner,
      });

      const voucherSuppliesRepository = new VoucherSuppliesRepository();
      const voucherSupplies = await voucherSuppliesRepository.getAllVoucherSupplies();

      expect(voucherSupplies.length).to.eql(1);

      const foundVoucherSupply = voucherSupplies[0];

      expect(foundVoucherSupply.toObject()).to.eql(
        savedVoucherSupply.toObject()
      );
    });

    it("returns an empty array when no voucher sets exist", async () => {
      const voucherSuppliesRepository = new VoucherSuppliesRepository();
      const voucherSupplies = await voucherSuppliesRepository.getAllVoucherSupplies();

      expect(voucherSupplies).to.eql([]);
    });
  });

  context("getAllVoucherSuppliesByOwner", () => {
    it("returns voucher supplies created by the provided owner latest first", async () => {
      const voucherOwner1 = Random.address();
      const voucherOwner2 = Random.address();
      const voucherOwner3 = Random.address();

      const ownerVoucherSupply1 = new VoucherSupply({
        ...Random.voucherSupplyMetadata({
          offeredDate: Date.now() - 10000,
        }),
        voucherOwner: voucherOwner1,
        imagefiles: [Random.fileRef(), Random.fileRef()],
        visible: true,
      });
      const ownerVoucherSupply2 = new VoucherSupply({
        ...Random.voucherSupplyMetadata({
          offeredDate: Date.now() - 5000,
        }),
        voucherOwner: voucherOwner1,
        imagefiles: [Random.fileRef(), Random.fileRef()],
        visible: true,
      });
      const otherVoucherSupply1 = new VoucherSupply({
        ...Random.voucherSupplyMetadata(),
        voucherOwner: voucherOwner2,
        imagefiles: [Random.fileRef(), Random.fileRef()],
        visible: true,
      });
      const otherVoucherSupply2 = new VoucherSupply({
        ...Random.voucherSupplyMetadata(),
        voucherOwner: voucherOwner3,
        imagefiles: [Random.fileRef(), Random.fileRef()],
        visible: true,
      });

      await ownerVoucherSupply1.save();
      await ownerVoucherSupply2.save();
      await otherVoucherSupply1.save();
      await otherVoucherSupply2.save();

      const voucherSuppliesRepository = new VoucherSuppliesRepository();
      const ownerVoucherSupplies = await voucherSuppliesRepository.getAllVoucherSuppliesByOwner(
        voucherOwner1
      );

      expect(ownerVoucherSupplies.length).to.eql(2);
      expect(ownerVoucherSupplies[0]).to.eql({
        _id: ownerVoucherSupply2._id,
        voucherOwner: voucherOwner1,
        title: ownerVoucherSupply2.title,
        price: ownerVoucherSupply2.price,
        description: ownerVoucherSupply2.description,
        imagefiles: ownerVoucherSupply2.imagefiles,
        expiryDate: ownerVoucherSupply2.expiryDate,
        startDate: ownerVoucherSupply2.startDate,
        qty: ownerVoucherSupply2.qty,
        visible: ownerVoucherSupply2.visible,
      });
      expect(ownerVoucherSupplies[1]).to.eql({
        _id: ownerVoucherSupply1._id,
        voucherOwner: voucherOwner1,
        title: ownerVoucherSupply1.title,
        price: ownerVoucherSupply1.price,
        description: ownerVoucherSupply1.description,
        imagefiles: ownerVoucherSupply1.imagefiles,
        expiryDate: ownerVoucherSupply1.expiryDate,
        startDate: ownerVoucherSupply1.startDate,
        qty: ownerVoucherSupply1.qty,
        visible: ownerVoucherSupply1.visible,
      });
    });

    it("returns empty list when owner has no voucher supplies", async () => {
      const voucherOwner1 = Random.address();
      const voucherOwner2 = Random.address();
      const voucherOwner3 = Random.address();

      const owner2VoucherSupply1 = new VoucherSupply({
        ...Random.voucherSupplyMetadata(),
        voucherOwner: voucherOwner2,
        imagefiles: [Random.fileRef(), Random.fileRef()],
        visible: true,
      });
      const owner2VoucherSupply2 = new VoucherSupply({
        ...Random.voucherSupplyMetadata(),
        voucherOwner: voucherOwner2,
        imagefiles: [Random.fileRef(), Random.fileRef()],
        visible: true,
      });
      const owner3VoucherSupply1 = new VoucherSupply({
        ...Random.voucherSupplyMetadata(),
        voucherOwner: voucherOwner3,
        imagefiles: [Random.fileRef(), Random.fileRef()],
        visible: true,
      });
      const owner3VoucherSupply2 = new VoucherSupply({
        ...Random.voucherSupplyMetadata(),
        voucherOwner: voucherOwner3,
        imagefiles: [Random.fileRef(), Random.fileRef()],
        visible: true,
      });

      await owner2VoucherSupply1.save();
      await owner2VoucherSupply2.save();
      await owner3VoucherSupply1.save();
      await owner3VoucherSupply2.save();

      const voucherSuppliesRepository = new VoucherSuppliesRepository();
      const owner1VoucherSupplies = await voucherSuppliesRepository.getAllVoucherSuppliesByOwner(
        voucherOwner1
      );

      expect(owner1VoucherSupplies).to.eql([]);
    });
  });

  context("getActiveVoucherSuppliesByOwner", () => {
    it(
      "returns voucher supplies created by the provided owner latest " +
        "first if still active (after start date, before expiry and with " +
        "remaining quantity)",
      async () => {
        const voucherOwner1 = Random.address().toLowerCase();
        const voucherOwner2 = Random.address().toLowerCase();

        const alreadyExpiredDate = Random.pastDateUnixMillis();
        const notYetExpiredDate = Random.futureDateUnixMillis();
        const alreadyStartedDate = Random.pastDateUnixMillisBefore(
          alreadyExpiredDate
        );
        const notYetStartedDate = Random.futureDateUnixMillisBefore(
          notYetExpiredDate
        );

        const availableQuantity = 5;
        const unavailableQuantity = 0;

        const ownerInactiveVoucherSupply1 = new VoucherSupply({
          ...Random.voucherSupplyMetadata({
            startDate: notYetStartedDate,
            expiryDate: notYetExpiredDate,
            qty: availableQuantity,
          }),
          voucherOwner: voucherOwner1,
          imagefiles: [Random.fileRef(), Random.fileRef()],
          visible: true,
        });
        const ownerInactiveVoucherSupply2 = new VoucherSupply({
          ...Random.voucherSupplyMetadata({
            startDate: alreadyStartedDate,
            expiryDate: alreadyExpiredDate,
            qty: availableQuantity,
          }),
          voucherOwner: voucherOwner1,
          imagefiles: [Random.fileRef(), Random.fileRef()],
          visible: true,
        });
        const ownerInactiveVoucherSupply3 = new VoucherSupply({
          ...Random.voucherSupplyMetadata({
            startDate: alreadyStartedDate,
            expiryDate: notYetExpiredDate,
            qty: unavailableQuantity,
          }),
          voucherOwner: voucherOwner1,
          imagefiles: [Random.fileRef(), Random.fileRef()],
          visible: true,
        });
        const ownerActiveVoucherSupply1 = new VoucherSupply({
          ...Random.voucherSupplyMetadata({
            startDate: alreadyStartedDate,
            expiryDate: notYetExpiredDate,
            qty: availableQuantity,
            offeredDate: Date.now() - 10000,
          }),
          voucherOwner: voucherOwner1,
          imagefiles: [Random.fileRef(), Random.fileRef()],
          visible: true,
        });

        const ownerActiveVoucherSupply2 = new VoucherSupply({
          ...Random.voucherSupplyMetadata({
            startDate: alreadyStartedDate,
            expiryDate: notYetExpiredDate,
            qty: availableQuantity,
            offeredDate: Date.now() - 5000,
          }),
          voucherOwner: voucherOwner1,
          imagefiles: [Random.fileRef(), Random.fileRef()],
          visible: true,
        });
        const otherVoucherSupply1 = new VoucherSupply({
          ...Random.voucherSupplyMetadata(),
          voucherOwner: voucherOwner2,
          imagefiles: [Random.fileRef(), Random.fileRef()],
          visible: true,
        });
        const otherVoucherSupply2 = new VoucherSupply({
          ...Random.voucherSupplyMetadata(),
          voucherOwner: voucherOwner2,
          imagefiles: [Random.fileRef(), Random.fileRef()],
          visible: true,
        });

        await ownerInactiveVoucherSupply1.save();
        await ownerInactiveVoucherSupply2.save();
        await ownerInactiveVoucherSupply3.save();
        await ownerActiveVoucherSupply1.save();
        await ownerActiveVoucherSupply2.save();
        await otherVoucherSupply1.save();
        await otherVoucherSupply2.save();

        const voucherSuppliesRepository = new VoucherSuppliesRepository();
        const ownerVoucherSupplies = await voucherSuppliesRepository.getActiveVoucherSuppliesByOwner(
          voucherOwner1
        );

        expect(ownerVoucherSupplies.length).to.eql(2);
        expect(ownerVoucherSupplies[0]).to.eql({
          _id: ownerActiveVoucherSupply2._id,
          voucherOwner: voucherOwner1,
          title: ownerActiveVoucherSupply2.title,
          price: ownerActiveVoucherSupply2.price,
          description: ownerActiveVoucherSupply2.description,
          imagefiles: ownerActiveVoucherSupply2.imagefiles,
          expiryDate: ownerActiveVoucherSupply2.expiryDate,
          startDate: ownerActiveVoucherSupply2.startDate,
          qty: ownerActiveVoucherSupply2.qty,
          visible: ownerActiveVoucherSupply2.visible,
        });
        expect(ownerVoucherSupplies[1]).to.eql({
          _id: ownerActiveVoucherSupply1._id,
          voucherOwner: voucherOwner1,
          title: ownerActiveVoucherSupply1.title,
          price: ownerActiveVoucherSupply1.price,
          description: ownerActiveVoucherSupply1.description,
          imagefiles: ownerActiveVoucherSupply1.imagefiles,
          expiryDate: ownerActiveVoucherSupply1.expiryDate,
          startDate: ownerActiveVoucherSupply1.startDate,
          qty: ownerActiveVoucherSupply1.qty,
          visible: ownerActiveVoucherSupply1.visible,
        });
      }
    );

    it("returns empty list when owner has no active voucher supplies", async () => {
      const voucherOwner1 = Random.address();
      const voucherOwner2 = Random.address();
      const voucherOwner3 = Random.address();

      const alreadyExpiredDate = Random.pastDateUnixMillis();
      const notYetExpiredDate = Random.futureDateUnixMillis();
      const alreadyStartedDate = Random.pastDateUnixMillisBefore(
        alreadyExpiredDate
      );
      const notYetStartedDate = Random.futureDateUnixMillisBefore(
        notYetExpiredDate
      );

      const availableQuantity = 5;
      const unavailableQuantity = 0;

      const owner1InactiveVoucherSupply1 = new VoucherSupply({
        ...Random.voucherSupplyMetadata({
          startDate: notYetStartedDate,
          expiryDate: notYetExpiredDate,
          qty: availableQuantity,
        }),
        voucherOwner: voucherOwner1,
        imagefiles: [Random.fileRef(), Random.fileRef()],
        visible: true,
      });
      const owner1InactiveVoucherSupply2 = new VoucherSupply({
        ...Random.voucherSupplyMetadata({
          startDate: alreadyStartedDate,
          expiryDate: alreadyExpiredDate,
          qty: availableQuantity,
        }),
        voucherOwner: voucherOwner1,
        imagefiles: [Random.fileRef(), Random.fileRef()],
        visible: true,
      });
      const owner1InactiveVoucherSupply3 = new VoucherSupply({
        ...Random.voucherSupplyMetadata({
          startDate: alreadyStartedDate,
          expiryDate: notYetExpiredDate,
          qty: unavailableQuantity,
        }),
        voucherOwner: voucherOwner1,
        imagefiles: [Random.fileRef(), Random.fileRef()],
        visible: true,
      });
      const owner2VoucherSupply1 = new VoucherSupply({
        ...Random.voucherSupplyMetadata(),
        voucherOwner: voucherOwner2,
        imagefiles: [Random.fileRef(), Random.fileRef()],
        visible: true,
      });
      const owner2VoucherSupply2 = new VoucherSupply({
        ...Random.voucherSupplyMetadata(),
        voucherOwner: voucherOwner2,
        imagefiles: [Random.fileRef(), Random.fileRef()],
        visible: true,
      });
      const owner3VoucherSupply1 = new VoucherSupply({
        ...Random.voucherSupplyMetadata(),
        voucherOwner: voucherOwner3,
        imagefiles: [Random.fileRef(), Random.fileRef()],
        visible: true,
      });
      const owner3VoucherSupply2 = new VoucherSupply({
        ...Random.voucherSupplyMetadata(),
        voucherOwner: voucherOwner3,
        imagefiles: [Random.fileRef(), Random.fileRef()],
        visible: true,
      });

      await owner1InactiveVoucherSupply1.save();
      await owner1InactiveVoucherSupply2.save();
      await owner1InactiveVoucherSupply3.save();
      await owner2VoucherSupply1.save();
      await owner2VoucherSupply2.save();
      await owner3VoucherSupply1.save();
      await owner3VoucherSupply2.save();

      const voucherSuppliesRepository = new VoucherSuppliesRepository();
      const owner1VoucherSupplies = await voucherSuppliesRepository.getActiveVoucherSuppliesByOwner(
        voucherOwner1
      );

      expect(owner1VoucherSupplies).to.eql([]);
    });

    it("returns empty list when owner has no voucher supplies at all", async () => {
      const voucherOwner1 = Random.address();
      const voucherOwner2 = Random.address();
      const voucherOwner3 = Random.address();

      const owner2VoucherSupply1 = new VoucherSupply({
        ...Random.voucherSupplyMetadata(),
        voucherOwner: voucherOwner2,
        imagefiles: [Random.fileRef(), Random.fileRef()],
        visible: true,
      });
      const owner2VoucherSupply2 = new VoucherSupply({
        ...Random.voucherSupplyMetadata(),
        voucherOwner: voucherOwner2,
        imagefiles: [Random.fileRef(), Random.fileRef()],
        visible: true,
      });
      const owner3VoucherSupply1 = new VoucherSupply({
        ...Random.voucherSupplyMetadata(),
        voucherOwner: voucherOwner3,
        imagefiles: [Random.fileRef(), Random.fileRef()],
        visible: true,
      });
      const owner3VoucherSupply2 = new VoucherSupply({
        ...Random.voucherSupplyMetadata(),
        voucherOwner: voucherOwner3,
        imagefiles: [Random.fileRef(), Random.fileRef()],
        visible: true,
      });

      await owner2VoucherSupply1.save();
      await owner2VoucherSupply2.save();
      await owner3VoucherSupply1.save();
      await owner3VoucherSupply2.save();

      const voucherSuppliesRepository = new VoucherSuppliesRepository();
      const owner1VoucherSupplies = await voucherSuppliesRepository.getActiveVoucherSuppliesByOwner(
        voucherOwner1
      );

      expect(owner1VoucherSupplies).to.eql([]);
    });
  });

  context("getInactiveVoucherSuppliesByOwner", () => {
    it(
      "returns voucher supplies created by the provided owner latest " +
        "first if not active (before start date, after expiry or with " +
        "no quantity)",
      async () => {
        const voucherOwner1 = Random.address().toLowerCase();
        const voucherOwner2 = Random.address().toLowerCase();

        const alreadyExpiredDate = Random.pastDateUnixMillis();
        const notYetExpiredDate = Random.futureDateUnixMillis();
        const alreadyStartedDate = Random.pastDateUnixMillisBefore(
          alreadyExpiredDate
        );
        const notYetStartedDate = Random.futureDateUnixMillisBefore(
          notYetExpiredDate
        );

        const availableQuantity = 5;
        const unavailableQuantity = 0;

        const ownerInactiveVoucherSupply1 = new VoucherSupply({
          ...Random.voucherSupplyMetadata({
            startDate: notYetStartedDate,
            expiryDate: notYetExpiredDate,
            qty: availableQuantity,
            offeredDate: Date.now() - 10000,
          }),
          voucherOwner: voucherOwner1,
          imagefiles: [Random.fileRef(), Random.fileRef()],
          visible: true,
        });
        const ownerInactiveVoucherSupply2 = new VoucherSupply({
          ...Random.voucherSupplyMetadata({
            startDate: alreadyStartedDate,
            expiryDate: alreadyExpiredDate,
            qty: availableQuantity,
            offeredDate: Date.now() - 5000,
          }),
          voucherOwner: voucherOwner1,
          imagefiles: [Random.fileRef(), Random.fileRef()],
          visible: true,
        });
        const ownerInactiveVoucherSupply3 = new VoucherSupply({
          ...Random.voucherSupplyMetadata({
            startDate: alreadyStartedDate,
            expiryDate: notYetExpiredDate,
            qty: unavailableQuantity,
            offeredDate: Date.now(),
          }),
          voucherOwner: voucherOwner1,
          imagefiles: [Random.fileRef(), Random.fileRef()],
          visible: true,
        });
        const ownerActiveVoucherSupply1 = new VoucherSupply({
          ...Random.voucherSupplyMetadata({
            startDate: alreadyStartedDate,
            expiryDate: notYetExpiredDate,
            qty: availableQuantity,
          }),
          voucherOwner: voucherOwner1,
          imagefiles: [Random.fileRef(), Random.fileRef()],
          visible: true,
        });
        const ownerActiveVoucherSupply2 = new VoucherSupply({
          ...Random.voucherSupplyMetadata({
            startDate: alreadyStartedDate,
            expiryDate: notYetExpiredDate,
            qty: availableQuantity,
          }),
          voucherOwner: voucherOwner1,
          imagefiles: [Random.fileRef(), Random.fileRef()],
          visible: true,
        });
        const otherVoucherSupply1 = new VoucherSupply({
          ...Random.voucherSupplyMetadata(),
          voucherOwner: voucherOwner2,
          imagefiles: [Random.fileRef(), Random.fileRef()],
          visible: true,
        });
        const otherVoucherSupply2 = new VoucherSupply({
          ...Random.voucherSupplyMetadata(),
          voucherOwner: voucherOwner2,
          imagefiles: [Random.fileRef(), Random.fileRef()],
          visible: true,
        });

        await ownerInactiveVoucherSupply1.save();
        await ownerInactiveVoucherSupply2.save();
        await ownerInactiveVoucherSupply3.save();
        await ownerActiveVoucherSupply1.save();
        await ownerActiveVoucherSupply2.save();
        await otherVoucherSupply1.save();
        await otherVoucherSupply2.save();

        const voucherSuppliesRepository = new VoucherSuppliesRepository();
        const ownerVoucherSupplies = await voucherSuppliesRepository.getInactiveVoucherSuppliesByOwner(
          voucherOwner1
        );

        expect(ownerVoucherSupplies.length).to.eql(3);
        expect(ownerVoucherSupplies[0]).to.eql({
          _id: ownerInactiveVoucherSupply3._id,
          voucherOwner: voucherOwner1,
          title: ownerInactiveVoucherSupply3.title,
          price: ownerInactiveVoucherSupply3.price,
          description: ownerInactiveVoucherSupply3.description,
          imagefiles: ownerInactiveVoucherSupply3.imagefiles,
          expiryDate: ownerInactiveVoucherSupply3.expiryDate,
          startDate: ownerInactiveVoucherSupply3.startDate,
          qty: ownerInactiveVoucherSupply3.qty,
          visible: ownerInactiveVoucherSupply3.visible,
        });
        expect(ownerVoucherSupplies[1]).to.eql({
          _id: ownerInactiveVoucherSupply2._id,
          voucherOwner: voucherOwner1,
          title: ownerInactiveVoucherSupply2.title,
          price: ownerInactiveVoucherSupply2.price,
          description: ownerInactiveVoucherSupply2.description,
          imagefiles: ownerInactiveVoucherSupply2.imagefiles,
          expiryDate: ownerInactiveVoucherSupply2.expiryDate,
          startDate: ownerInactiveVoucherSupply2.startDate,
          qty: ownerInactiveVoucherSupply2.qty,
          visible: ownerInactiveVoucherSupply2.visible,
        });
        expect(ownerVoucherSupplies[2]).to.eql({
          _id: ownerInactiveVoucherSupply1._id,
          voucherOwner: voucherOwner1,
          title: ownerInactiveVoucherSupply1.title,
          price: ownerInactiveVoucherSupply1.price,
          description: ownerInactiveVoucherSupply1.description,
          imagefiles: ownerInactiveVoucherSupply1.imagefiles,
          expiryDate: ownerInactiveVoucherSupply1.expiryDate,
          startDate: ownerInactiveVoucherSupply1.startDate,
          qty: ownerInactiveVoucherSupply1.qty,
          visible: ownerInactiveVoucherSupply1.visible,
        });
      }
    );

    it("returns empty list when owner has no inactive voucher supplies", async () => {
      const voucherOwner1 = Random.address();
      const voucherOwner2 = Random.address();
      const voucherOwner3 = Random.address();

      const notYetExpiredDate = Random.futureDateUnixMillis();
      const alreadyStartedDate = Random.pastDateUnixMillis();

      const availableQuantity = 5;

      const owner1ActiveVoucherSupply1 = new VoucherSupply({
        ...Random.voucherSupplyMetadata({
          startDate: alreadyStartedDate,
          expiryDate: notYetExpiredDate,
          qty: availableQuantity,
        }),
        voucherOwner: voucherOwner1,
        imagefiles: [Random.fileRef(), Random.fileRef()],
        visible: true,
      });
      const owner1ActiveVoucherSupply2 = new VoucherSupply({
        ...Random.voucherSupplyMetadata({
          startDate: alreadyStartedDate,
          expiryDate: notYetExpiredDate,
          qty: availableQuantity,
        }),
        voucherOwner: voucherOwner1,
        imagefiles: [Random.fileRef(), Random.fileRef()],
        visible: true,
      });
      const owner2VoucherSupply1 = new VoucherSupply({
        ...Random.voucherSupplyMetadata(),
        voucherOwner: voucherOwner2,
        imagefiles: [Random.fileRef(), Random.fileRef()],
        visible: true,
      });
      const owner2VoucherSupply2 = new VoucherSupply({
        ...Random.voucherSupplyMetadata(),
        voucherOwner: voucherOwner2,
        imagefiles: [Random.fileRef(), Random.fileRef()],
        visible: true,
      });
      const owner3VoucherSupply1 = new VoucherSupply({
        ...Random.voucherSupplyMetadata(),
        voucherOwner: voucherOwner3,
        imagefiles: [Random.fileRef(), Random.fileRef()],
        visible: true,
      });
      const owner3VoucherSupply2 = new VoucherSupply({
        ...Random.voucherSupplyMetadata(),
        voucherOwner: voucherOwner3,
        imagefiles: [Random.fileRef(), Random.fileRef()],
        visible: true,
      });

      await owner1ActiveVoucherSupply1.save();
      await owner1ActiveVoucherSupply2.save();
      await owner2VoucherSupply1.save();
      await owner2VoucherSupply2.save();
      await owner3VoucherSupply1.save();
      await owner3VoucherSupply2.save();

      const voucherSuppliesRepository = new VoucherSuppliesRepository();
      const owner1VoucherSupplies = await voucherSuppliesRepository.getInactiveVoucherSuppliesByOwner(
        voucherOwner1
      );

      expect(owner1VoucherSupplies).to.eql([]);
    });

    it("returns empty list when owner has no voucher supplies at all", async () => {
      const voucherOwner1 = Random.address();
      const voucherOwner2 = Random.address();
      const voucherOwner3 = Random.address();

      const owner2VoucherSupply1 = new VoucherSupply({
        ...Random.voucherSupplyMetadata(),
        voucherOwner: voucherOwner2,
        imagefiles: [Random.fileRef(), Random.fileRef()],
        visible: true,
      });
      const owner2VoucherSupply2 = new VoucherSupply({
        ...Random.voucherSupplyMetadata(),
        voucherOwner: voucherOwner2,
        imagefiles: [Random.fileRef(), Random.fileRef()],
        visible: true,
      });
      const owner3VoucherSupply1 = new VoucherSupply({
        ...Random.voucherSupplyMetadata(),
        voucherOwner: voucherOwner3,
        imagefiles: [Random.fileRef(), Random.fileRef()],
        visible: true,
      });
      const owner3VoucherSupply2 = new VoucherSupply({
        ...Random.voucherSupplyMetadata(),
        voucherOwner: voucherOwner3,
        imagefiles: [Random.fileRef(), Random.fileRef()],
        visible: true,
      });

      await owner2VoucherSupply1.save();
      await owner2VoucherSupply2.save();
      await owner3VoucherSupply1.save();
      await owner3VoucherSupply2.save();

      const voucherSuppliesRepository = new VoucherSuppliesRepository();
      const owner1VoucherSupplies = await voucherSuppliesRepository.getInactiveVoucherSuppliesByOwner(
        voucherOwner1
      );

      expect(owner1VoucherSupplies).to.eql([]);
    });
  });

  context("getVoucherSupplyDetails", () => {
    it("pushes voucher supply details into the provided list when the voucher supply exists", async () => {
      const voucherOwner1 = Random.address();
      const fileRefs1 = [Random.fileRef(), Random.fileRef()];
      const voucherSupplyMetadata1 = Random.voucherSupplyMetadata();

      const voucherSupply1 = new VoucherSupply({
        ...voucherSupplyMetadata1,
        voucherOwner: voucherOwner1,
        imagefiles: fileRefs1,
        visible: true,
      });
      await voucherSupply1.save();

      const voucherOwner2 = Random.address();
      const fileRefs2 = [Random.fileRef(), Random.fileRef()];
      const voucherSupplyMetadata2 = Random.voucherSupplyMetadata();

      const voucherSupply2 = new VoucherSupply({
        ...voucherSupplyMetadata2,
        voucherOwner: voucherOwner2,
        imagefiles: fileRefs2,
        visible: true,
      });
      await voucherSupply2.save();

      const voucherMetadata1 = Random.voucherMetadata();

      const voucher1 = new Voucher({
        supplyID: voucherSupply1.id,
        _holder: voucherMetadata1._holder.toLowerCase(),
        _tokenIdSupply: voucherMetadata1._tokenIdSupply,
        _tokenIdVoucher: voucherMetadata1._tokenIdVoucher,
        [voucherStatuses.COMMITTED]: new Date().getTime(),
        [voucherStatuses.CANCELLED]: "",
        [voucherStatuses.COMPLAINED]: "",
        [voucherStatuses.REDEEMED]: "",
        [voucherStatuses.REFUNDED]: "",
        [voucherStatuses.FINALIZED]: "",
        voucherOwner: voucherMetadata1._issuer.toLowerCase(),
        actionDate: new Date().getTime(),
      });

      const voucherMetadata2 = Random.voucherMetadata();

      const voucher2 = new Voucher({
        supplyID: voucherSupply2.id,
        _holder: voucherMetadata2._holder.toLowerCase(),
        _tokenIdSupply: voucherMetadata2._tokenIdSupply,
        _tokenIdVoucher: voucherMetadata2._tokenIdVoucher,
        [voucherStatuses.COMMITTED]: new Date().getTime(),
        [voucherStatuses.CANCELLED]: "",
        [voucherStatuses.COMPLAINED]: "",
        [voucherStatuses.REDEEMED]: "",
        [voucherStatuses.REFUNDED]: "",
        [voucherStatuses.FINALIZED]: "",
        voucherOwner: voucherMetadata2._issuer.toLowerCase(),
        actionDate: new Date().getTime(),
      });

      const voucherSupplyDetailsList = [];

      const voucherSuppliesRepository = new VoucherSuppliesRepository();
      await voucherSuppliesRepository.getVoucherSupplyDetails(
        voucher1,
        voucherSupplyDetailsList
      );
      await voucherSuppliesRepository.getVoucherSupplyDetails(
        voucher2,
        voucherSupplyDetailsList
      );

      expect(voucherSupplyDetailsList.length).to.eql(2);
      expect(voucherSupplyDetailsList[0]).to.eql({
        _id: voucher1.id,
        title: voucherSupply1.title,
        qty: voucherSupply1.qty,
        description: voucherSupply1.description,
        imagefiles: voucherSupply1.imagefiles,
        category: voucherSupply1.category,
        price: voucherSupply1.price,
        expiryDate: voucherSupply1.expiryDate,
        visible: voucherSupply1.visible,
        CANCELLED: voucher1.CANCELLED,
        COMMITTED: voucher1.COMMITTED,
        COMPLAINED: voucher1.COMPLAINED,
        EXPIRED: voucher1.EXPIRED,
        FINALIZED: voucher1.FINALIZED,
        REDEEMED: voucher1.REDEEMED,
        REFUNDED: voucher1.REFUNDED,
      });
      expect(voucherSupplyDetailsList[1]).to.eql({
        _id: voucher2.id,
        title: voucherSupply2.title,
        qty: voucherSupply2.qty,
        description: voucherSupply2.description,
        imagefiles: voucherSupply2.imagefiles,
        category: voucherSupply2.category,
        price: voucherSupply2.price,
        expiryDate: voucherSupply2.expiryDate,
        visible: voucherSupply2.visible,
        CANCELLED: voucher2.CANCELLED,
        COMMITTED: voucher2.COMMITTED,
        COMPLAINED: voucher2.COMPLAINED,
        EXPIRED: voucher2.EXPIRED,
        FINALIZED: voucher2.FINALIZED,
        REDEEMED: voucher2.REDEEMED,
        REFUNDED: voucher2.REFUNDED,
      });
    });

    it("throws an error when the voucher supply does not exist", async () => {
      const voucherMetadata = Random.voucherMetadata();

      const voucher = new Voucher({
        supplyID: Random.documentId(),
        _holder: voucherMetadata._holder.toLowerCase(),
        _tokenIdSupply: voucherMetadata._tokenIdSupply,
        _tokenIdVoucher: voucherMetadata._tokenIdVoucher,
        [voucherStatuses.COMMITTED]: new Date().getTime(),
        [voucherStatuses.CANCELLED]: "",
        [voucherStatuses.COMPLAINED]: "",
        [voucherStatuses.REDEEMED]: "",
        [voucherStatuses.REFUNDED]: "",
        [voucherStatuses.FINALIZED]: "",
        voucherOwner: voucherMetadata._issuer.toLowerCase(),
        actionDate: new Date().getTime(),
      });

      const voucherSupplyDetailsList = [];

      const voucherSuppliesRepository = new VoucherSuppliesRepository();

      await expect(
        voucherSuppliesRepository.getVoucherSupplyDetails(
          voucher,
          voucherSupplyDetailsList
        )
      ).to.be.rejectedWith("Voucher supply not found");
    });
  });
});
