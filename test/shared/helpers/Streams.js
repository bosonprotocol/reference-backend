const Promises = require("./Promises");

const readBinary = (stream, cb) => {
  let data = "";

  stream.setEncoding("binary");
  stream.once("error", (err) => {
    return cb(err);
  });
  stream.on("data", (chunk) => (data += chunk));
  stream.on("end", () => {
    return cb(null, data);
  });
};

const readBinaryPromise = Promises.promisify(readBinary);

module.exports = { readBinary, readBinaryPromise };
