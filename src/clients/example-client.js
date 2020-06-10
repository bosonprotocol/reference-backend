const axios = require('axios');
const axiosInstance = axios.create({ baseURL: 'baseurl', headers: 'auth_header' });

/**
 * Client Interface exposing Wrapped API of any third party we would need. 
 */
class ExampleClient {

    /**
     * Example
     * Executes a Plain HTTP Request by a given type, path and body
     * @param type
     * @param path
     * @param body (optional)
     * @returns {AxiosPromise}
     * @private
     */
     static async _executeHTTPRequest(type, path, body) {
        try {
            return await axiosInstance({
                method: type,
                url: path,
                data: body
            });
        } catch (error) {
            throw new Error(`${error.message}; Path: ${path}; info: ${error.response.data.meta};`);
        }
    }

}

module.exports = ExampleClient;