const Promises = require("../../shared/helpers/Promises");

const readBinary = Promises.promisify((stream, cb) => {
  let data = "";

  stream.setEncoding("binary");
  stream.once("error", (err) => {
    return cb(err);
  });
  stream.on("data", (chunk) => (data += chunk));
  stream.on("end", () => {
    return cb(null, data);
  });
});

module.exports = { readBinary };
