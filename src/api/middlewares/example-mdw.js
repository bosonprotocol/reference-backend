const APIError = require('./../api-error');

class ExampleMiddleware {

    /**
     * function that serves as a bridge between the API and the interaction with a database and applications over network.
     * it gets executed before any other logic called by the endpoint is.
     */
    static async productValidation(req, res, next) {
        //insert some custom logic
        if (!true) {
            return next(new APIError(401, 'Unauthorized.'))
        }
        next();
    }
}

module.exports = ExampleMiddleware;
