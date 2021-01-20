const usersController = require('../controllers/users-controller');
const ErrorHandlers = require('../middlewares/error-handler');
const UserValidator = require('../middlewares/user-validator')
const authenticationMiddleware = require('../middlewares/authentication');

class UsersRouter {

    static route(expressApp) {
        let router = expressApp.Router();

        router.get('/:address/is-registered',
            ErrorHandlers.globalErrorHandler(usersController.isUserRegistered));

        router.post('/:address',
            ErrorHandlers.globalErrorHandler(usersController.generateNonce));

        router.post('/:address/verify-signature', 
            ErrorHandlers.globalErrorHandler(usersController.verifySignature))
    

        return router;
    }
}

module.exports = UsersRouter;
