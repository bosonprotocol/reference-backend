const GoogleSheetsConstants = {
  Auth: {
    keyFilePath: "keys.json", // must be in root of reference-backend dir
  },
  GetSellerWhitelist: {
    range: "Whitelist!B2:B11",
    scopes: [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/drive.readonly",
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/spreadsheets.readonly",
    ],
    valueRenderOption: "UNFORMATTED_VALUE",
    dateTimeRenderOption: "SERIAL_NUMBER",
    majorDimension: "ROWS",
  },
};

module.exports = GoogleSheetsConstants;
