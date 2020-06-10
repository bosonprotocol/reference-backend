/**
 * Standard Error thrown by our API
 */
class ApiError {

    constructor (code, message) {
        this.code = code;
        this.message = message;
    }

}

module.exports = ApiError;