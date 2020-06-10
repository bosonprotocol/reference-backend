const APIError = require('./../api-error');

/**
 * Example controller is used to showcase some of the potential errors you might expect to receive from within the API and outside the API.
 */
class ExampleErrorController {

    static apiError(req, res, next) {
        return next(new APIError(400, 'Bad request.'))
    }
    
    static globalError(req, res, next) {
        throw new Error('This is simulation of unexpected global error outside of the api')
    }
}

module.exports = ExampleErrorController;