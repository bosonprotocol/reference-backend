const GoogleSheetsConstants = {
  Auth: {
    keyFilePath: "keys.json", // must be in root of reference-backend dir
  },
  Scopes: {
    read: [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/drive.readonly",
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/spreadsheets.readonly",
    ],
  },
  GetSellerWhitelist: {
    range: "Whitelist!B2:B11",
    valueRenderOption: "UNFORMATTED_VALUE",
    dateTimeRenderOption: "SERIAL_NUMBER",
    majorDimension: "ROWS",
  },
  GetDraftListings: {
    range: "Products!A1:N25",
    valueRenderOption: "UNFORMATTED_VALUE",
    dateTimeRenderOption: "SERIAL_NUMBER",
    majorDimension: "ROWS",
  },
};

module.exports = GoogleSheetsConstants;
