const mongoose = require("mongoose");

const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
};

class MongooseClient {
  constructor(configurationService) {
    this.configurationService = configurationService;
  }

  connect() {
    return mongoose.connect(
      this.configurationService.databaseConnectionString,
      {
        ...options,
        dbName: this.configurationService.databaseName,
        user: this.configurationService.databaseUsername,
        pass: this.configurationService.databasePassword,
      }
    );
  }
}

module.exports = MongooseClient;
