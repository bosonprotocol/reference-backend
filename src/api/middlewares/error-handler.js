const APIError = require('../api-error');

class ErrorHandlers {

    /**
     * API Error handler used as a middleware. Triggered only by thrown Error by us
     * @param err
     * @param req
     * @param res
     * @param next
     */
    static apiErrorHandler (err, req, res, next) {
        if (err instanceof APIError) {
            res.status(err.code).json(err.message);
        } else {
            // This should not happen. If an error is thrown using NEXT it should be API Error.
            console.error(`An error occurred. Normal error was thrown using next, and not using API Error object - ${err}. Error stack: ${err.stack}`);
            res.status(500).json('Internal Server Error');
        }
    }

    /**
     * Global Error Handler that handles unexpected throws (NOT BY US)
     * @returns {Function}
     * @param f
     */
    static globalErrorHandler (f) {
        return async(req, res, next) => {
            try {
                await f(req, res, next);
            } catch (error) {
                console.error(`Something went wrong while executing request. ${error.stack}`);
                res.status(500).json('Internal Server Error');
            }
        }
    }

}

module.exports = ErrorHandlers;