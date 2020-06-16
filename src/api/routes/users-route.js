const usersController = require('../controllers/users-controller');
const ErrorHandlers = require('../middlewares/error-handler');
const authenticationMiddleware = require('../middlewares/authentication');

class UsersRouter {

    static route(expressApp) {
        let router = expressApp.Router();

        router.post('/:address', 
            ErrorHandlers.globalErrorHandler(usersController.generateNonce));

        router.post('/:address/verify-signature', 
            ErrorHandlers.globalErrorHandler(usersController.verifySignature))

        router.post('/:address/buy',
            ErrorHandlers.globalErrorHandler(authenticationMiddleware.authenticateToken),
            ErrorHandlers.globalErrorHandler(usersController.buy))

        
        return router;
    }
}

module.exports = UsersRouter;
