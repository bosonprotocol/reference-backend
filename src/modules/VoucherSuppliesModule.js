const FileStore = require("../utils/GCPStorage");

const ErrorHandlingMiddleware = require("../api/middlewares/ErrorHandlingMiddleware");
const EventValidationMiddleware = require("../api/middlewares/EventValidationMiddleware");
const FileValidator = require("../services/FileValidator");
const FileStorageMiddleware = require("../api/middlewares/FileStorageMiddleware");
const VoucherSupplyValidationMiddleware = require("../api/middlewares/VoucherSupplyValidationMiddleware");
const VoucherSuppliesController = require("../api/controllers/VoucherSuppliesController");

class VoucherSuppliesModule {
  constructor({
    configurationService,
    userAuthenticationMiddleware,
    voucherImageStorageMiddleware,
    voucherSupplyValidationMiddleware,
    eventValidationMiddleware,
    voucherSuppliesRepository,
    voucherSuppliesController,
  }) {
    this.userAuthenticationMiddleware = userAuthenticationMiddleware;
    this.eventValidationMiddleware =
      eventValidationMiddleware || new EventValidationMiddleware();
    this.voucherImageStorageMiddleware =
      voucherImageStorageMiddleware ||
      new FileStorageMiddleware(
        configurationService.imageUploadFileFieldName,
        configurationService.imageUploadMaximumFiles,
        new FileValidator(
          configurationService.imageUploadSupportedMimeTypes,
          configurationService.imageUploadMinimumFileSizeInKB,
          configurationService.imageUploadMaximumFileSizeInKB
        ),
        new FileStore(configurationService.imageUploadStorageBucketName)
      );
    this.voucherSupplyValidationMiddleware =
      voucherSupplyValidationMiddleware ||
      new VoucherSupplyValidationMiddleware(voucherSuppliesRepository);
    this.voucherSuppliesController =
      voucherSuppliesController ||
      new VoucherSuppliesController(voucherSuppliesRepository);
  }

  mountPoint() {
    return "/voucher-sets";
  }

  addRoutesTo(router) {
    router.post(
      "/",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.userAuthenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.voucherImageStorageMiddleware.storeFiles(req, res, next)
      ),
      // TODO Do we need all location fields to be required? Do we need to
      // revert if specified location is not in a valid format.
      // Normally there should not be anything to worry since we muse ensure all
      // correct data is sent from the client but just as further think about it
      // (This is not a blockchain mandatory field, hence a successful tx could
      // be executed and then we revert here)
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.voucherSupplyValidationMiddleware.validateLocation(req, res, next)
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.voucherSupplyValidationMiddleware.validateDates(req, res, next)
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.voucherSupplyValidationMiddleware.validateVoucherSupplyByCorrelationIdDoesNotExist(
          req,
          res,
          next
        )
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.voucherSuppliesController.createVoucherSupply(req, res, next)
      )
    );

    router.get(
      "/:id",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.voucherSupplyValidationMiddleware.validateVoucherSupplyExists(
          req,
          res,
          next
        )
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.voucherSuppliesController.getVoucherSupply(req, res, next)
      )
    );

    router.get(
      "/",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.voucherSuppliesController.getAllVoucherSupplies(req, res, next)
      )
    );

    router.get(
      "/status/all",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.userAuthenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.voucherSuppliesController.getSupplyStatuses(req, res, next)
      )
    );

    router.get(
      "/status/active",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.userAuthenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.voucherSuppliesController.getActiveSupplies(req, res, next)
      )
    );

    router.get(
      "/status/inactive",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.userAuthenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.voucherSuppliesController.getInactiveSupplies(req, res, next)
      )
    );

    router.get(
      "/sell/:address",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.voucherSuppliesController.getSellerSupplies(req, res, next)
      )
    );

    router.get(
      "/buy/:address",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.voucherSuppliesController.getBuyerSupplies(req, res, next)
      )
    );

    router.patch(
      "/set-supply-meta",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.userAuthenticationMiddleware.authenticateGCLOUDService(
          req,
          res,
          next
        )
      ),
      //TODO if we are to support updates outside reference app, we should not have this validator, since it will always reverts in such scenario
      // ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
      //   this.voucherSupplyValidationMiddleware.validateVoucherSupplyExistsByOwnerAndCorrelationId(
      //     req,
      //     res,
      //     next
      //   )
      // ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.eventValidationMiddleware.validateVoucherMetadata(req, res, next)
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.voucherSuppliesController.setSupplyMetaOnOrderCreated(
          req,
          res,
          next
        )
      )
    );

    router.patch(
      "/update-supply-ontransfer",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.userAuthenticationMiddleware.authenticateGCLOUDService(
          req,
          res,
          next
        )
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.eventValidationMiddleware.validateVoucherMetadataOnTransfer(
          req,
          res,
          next
        )
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.voucherSuppliesController.updateSupplyOnTransfer(req, res, next)
      )
    );

    router.patch(
      "/update-supply-oncancel",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.userAuthenticationMiddleware.authenticateGCLOUDService(
          req,
          res,
          next
        )
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.eventValidationMiddleware.validateVoucherMetadata(req, res, next)
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.voucherSuppliesController.updateSupplyOnCancel(req, res, next)
      )
    );

    router.patch(
      "/:id",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.userAuthenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.voucherImageStorageMiddleware.storeFiles(req, res, next)
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.voucherSupplyValidationMiddleware.validateLocation(req, res, next)
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.voucherSupplyValidationMiddleware.validateVoucherSupplyExists(
          req,
          res,
          next
        )
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.voucherSupplyValidationMiddleware.validateCanUpdateVoucherSupply(
          req,
          res,
          next
        )
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.voucherSuppliesController.updateVoucherSupply(req, res, next)
      )
    );

    router.delete(
      "/:id",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.userAuthenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.voucherSupplyValidationMiddleware.validateVoucherSupplyExists(
          req,
          res,
          next
        )
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.voucherSupplyValidationMiddleware.validateCanDelete(req, res, next)
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.voucherSuppliesController.deleteVoucherSupply(req, res, next)
      )
    );

    router.delete(
      "/:id/image",
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.userAuthenticationMiddleware.authenticateToken(req, res, next)
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.voucherSupplyValidationMiddleware.validateVoucherSupplyExists(
          req,
          res,
          next
        )
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.voucherSupplyValidationMiddleware.validateCanDelete(req, res, next)
      ),
      ErrorHandlingMiddleware.globalErrorHandler((req, res, next) =>
        this.voucherSuppliesController.deleteImage(req, res, next)
      )
    );

    return router;
  }
}

module.exports = VoucherSuppliesModule;
