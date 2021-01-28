const VOUCHER_STATUS = require("./voucherStatus");
const BUCKET_NAME = process.env.VOUCHERS_BUCKET;

class VoucherUtils {
  static async uploadFiles(req) {
    if (!req.files) return [];

    const { Storage } = require("@google-cloud/storage");

    const PDF_CONTENT_TYPE = "application/pdf";
    const gcs = new Storage();
    const bucket = gcs.bucket(BUCKET_NAME);
    const subFolderName = req.body.title;
    const filesRefs = [];

    for (let i = 0; i < req.files.length; i++) {
      const fileName = req.files[i].originalname;
      const storageDestination = `${subFolderName}/${fileName}`;

      await bucket.upload(req.files[i].path, {
        destination: storageDestination,
        contentType: req.files[i].mimetype,
        resumable: false,
      });

      // Public link format - https://storage.googleapis.com/[BUCKET_NAME]/[OBJECT_NAME]
      await bucket.file(storageDestination).makePublic();

      filesRefs.push({
        url: `https://storage.googleapis.com/${BUCKET_NAME}/${storageDestination}`,
        type: req.files[i].mimetype === PDF_CONTENT_TYPE ? "document" : "image",
      });
    }

    return filesRefs;
  }

  static calcVoucherSupplyStatus(startDate, expiryDate, qty) {
    const isActive = true;
    const todayToMillis = new Date(Date.now()).getTime();
    const startToMillis = new Date(startDate).getTime();
    const expiryTomillis = new Date(expiryDate).getTime();

    if (
      todayToMillis < startDate ||
      todayToMillis > expiryTomillis ||
      qty <= 0
    ) {
      return VOUCHER_STATUS.INACTIVE;
    }

    return VOUCHER_STATUS.ACTIVE;
  }
}

module.exports = VoucherUtils;
