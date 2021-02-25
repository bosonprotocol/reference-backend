const mongoose = require("mongoose");

const ConfigurationService = require("../../../src/services/ConfigurationService");
const MongooseClient = require('../../../src/clients/MongooseClient')
const User = require("../../../src/database/models/User");
const Payment = require("../../../src/database/models/Payment");
const Voucher = require("../../../src/database/models/Voucher");
const VoucherSupply = require("../../../src/database/models/VoucherSupply");

class Database {
  static async connect() {
    const configurationService = new ConfigurationService();
    const mongooseClient = new MongooseClient(configurationService);

    return mongooseClient.connect();
  }

  static async disconnect() {
    return mongoose.disconnect();
  }

  static async truncateCollection(model) {
    await model.collection.deleteMany({});
  }

  static async truncate() {
    await this.truncateCollection(User);
    await this.truncateCollection(Payment);
    await this.truncateCollection(Voucher);
    await this.truncateCollection(VoucherSupply);
  }
}

module.exports = Database;
