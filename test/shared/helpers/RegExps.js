const uuidV4Pattern =
  "\\b[0-9a-f]{8}\\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\\b[0-9a-f]{12}\\b";

const uuidV4 = new RegExp(uuidV4Pattern);

module.exports = { uuidV4Pattern, uuidV4 };
