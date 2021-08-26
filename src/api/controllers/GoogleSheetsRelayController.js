const { google } = require("googleapis");
const constants = require("../../utils/googleSheetsConstants");

class GoogleSheetsRelayController {
  constructor() {
    this.sheets = google.sheets("v4");
    this.sheetId = process.env.GOOGLE_SHEETS_SHEET_ID;
  }

  /**
   * Retrieves the seller whitelist from the google
   * sheet and returns as an array of strings - all
   * formatted to be lowercase.
   * @returns [*] Array of whitelisted sellers
   */
  async getSellerWhitelist(req, res) {
    const range = constants.GetSellerWhitelist.range;
    const authScopes = constants.Scopes.read;

    let whitelist = [];

    try {
      const sheetData = await this.getSheetData(
        range,
        authScopes,
        constants.GetSellerWhitelist.valueRenderOption,
        constants.GetSellerWhitelist.dateTimeRenderOption,
        constants.GetSellerWhitelist.majorDimension
      ); // array of array of strings (i.e. array of row arrays - in this case each single due to whitelist format)

      if (sheetData) {
        whitelist = sheetData.map((x) => x[0].toLowerCase()); // format to lowercase and reformat to array of strings (from 2d array)
      }
    } catch (e) {
      console.log(e);
    }

    res.send(JSON.stringify(whitelist));
  }

  /**
   * Retrieves entries from the google sheet which
   * satisfy the following criteria: ready to process
   * must be true and creation status must be "NULL" -
   * formatted as an array of objects, each containing
   * the fields from the respective google sheets entry.
   * @returns [{}] Array of draft listings
   */
  async getDraftListings(req, res) {
    const range = constants.GetDraftListings.range;
    const authScopes = constants.Scopes.read;

    let products = [];

    try {
      const sheetData = await this.getSheetData(
        range,
        authScopes,
        constants.GetDraftListings.valueRenderOption,
        constants.GetDraftListings.dateTimeRenderOption,
        constants.GetDraftListings.majorDimension
      ); // array of rows (arrays)

      const heading = sheetData.shift(); // split heading from entries

      for (let i = 0; i < sheetData.length; i++) {
        // if not empty row AND Ready To Process is true AND Creation Status is NULL
        if (
          sheetData[i][0] !== "" &&
          sheetData[i][12] === true &&
          sheetData[i][13] === "NULL"
        ) {
          let productObject = {}; // create object first to use variables for keys
          for (let j = 0; j < heading.length; j++) {
            productObject[heading[j]] = sheetData[i][j]; // create an object entry with the corresponding heading as the key
          }

          products.push(productObject);
        }
      }
    } catch (e) {
      console.log(e);
    }

    res.send(JSON.stringify(products));
  }

  /**
   * Updates the creation status (of the given listing in
   * the google sheets) to "PENDING". This is done to avoid
   * processing the same listing twice.
   * @returns Boolean Request status denoting success/failure
   */
  updateCreationStatusPending() {
    //todo implement
  }

  /**
   * Updates the listing (the relevant google sheets entry) -
   * setting the creation status to "COMPLETE" and populating
   * the creation date, transaction hash and voucher-set ID.
   * @returns Boolean Request status denoting success/failure
   */
  updateVoucherSetCreated() {
    //todo implement
  }

  /**
   *
   * @param range The sheet and cell range in A1 format - e.g. "Whitelist!B2:B11"
   * @param scopes The scopes as a string array
   * @param valueRenderOption
   * @param dateTimeRenderOption
   * @param majorDimension
   * @returns {Promise<any[]>} Contents of requested range as an array
   */
  async getSheetData(
    range,
    scopes,
    valueRenderOption,
    dateTimeRenderOption,
    majorDimension
  ) {
    const authClient = await this.authorize(constants.Auth.keyFilePath, scopes);
    const googleSheetsInstance = google.sheets({
      version: "v4",
      auth: authClient,
    });

    const request = {
      spreadsheetId: this.sheetId,
      range: range, // The A1 notation of the values to retrieve.
      valueRenderOption: valueRenderOption, // How values should be represented in the output.
      dateTimeRenderOption: dateTimeRenderOption, // The default dateTime render option is [DateTimeRenderOption.SERIAL_NUMBER].
      majorDimension: majorDimension,
      auth: authClient,
    };

    try {
      const response = await googleSheetsInstance.spreadsheets.values.get(
        request
      );
      // const sheetCellRange = response.data.range; // todo this will be needed for POST/UPDATE requests

      return response.data.values;
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * This returns an auth client based on the
   * input parameters. A "keys.json" file must
   * exist in the root directory with the auth
   * credentials.
   * @param keyFilePath The file path to the "keys.json" file
   * @param scopes The required scopes
   * @returns {Promise<Compute|JWT|UserRefreshClient>}
   */
  async authorize(keyFilePath, scopes) {
    const authClient = new google.auth.GoogleAuth({
      keyFile: keyFilePath,
      scopes: scopes,
    });

    if (authClient == null) {
      throw Error("authentication failed");
    }

    return await authClient.getClient();
  }
}

module.exports = GoogleSheetsRelayController;
