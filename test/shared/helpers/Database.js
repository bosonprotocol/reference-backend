const mongoose = require("mongoose");

const ConfigurationService = require('../../../src/services/ConfigurationService')
const User = require("../../../src/database/models/User");
const Payment = require("../../../src/database/models/Payment");
const Voucher = require("../../../src/database/models/Voucher");
const VoucherSupply = require("../../../src/database/models/VoucherSupply");

class Database {
  static async connect() {
    const configurationService = new ConfigurationService();
    const databaseConnectionString =
      configurationService.databaseConnectionString ||
      "mongodb://admin:secret@localhost:27017/admin";
    return mongoose.connect(databaseConnectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
  }

  static async truncate() {
    await User.collection.deleteMany({});
    await Payment.collection.deleteMany({});
    await Voucher.collection.deleteMany({});
    await VoucherSupply.collection.deleteMany({});
  }
}

module.exports = Database;
