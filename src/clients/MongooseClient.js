const mongoose = require("mongoose");

const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
};

class MongooseClient {
  constructor(
    databaseConnectionString,
    databaseName,
    databaseUsername,
    databasePassword
  ) {
    this.databaseConnectionString = databaseConnectionString;
    this.databaseName = databaseName;
    this.databaseUsername = databaseUsername;
    this.databasePassword = databasePassword;
  }

  connect() {
    return mongoose.connect(this.databaseConnectionString, {
      ...options,
      dbName: this.databaseName,
      // user: this.databaseUsername,
      // pass: this.databasePassword,
    });
  }
}

module.exports = MongooseClient;
