const BUCKET_NAME = process.env.VOUCHERS_BUCKER;

class VoucherUtils {
    static async uploadFiles(req) {
        const { Storage } = require('@google-cloud/storage');

        const PDF_CONTENT_TYPE = 'application/pdf';
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
                resumable: false
            });

            // Public link format - https://storage.googleapis.com/[BUCKET_NAME]/[OBJECT_NAME]
            await bucket.file(storageDestination).makePublic();

            filesRefs.push({
                url: `https://storage.googleapis.com/${BUCKET_NAME}/${storageDestination}`,
                type: req.files[i].mimetype === PDF_CONTENT_TYPE ? 'document' : 'image'
            });
        }

        return filesRefs;
    }
}

module.exports = VoucherUtils;