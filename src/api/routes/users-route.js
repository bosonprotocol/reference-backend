const usersController = require('../controllers/users-controller');
const ErrorHandlers = require('../middlewares/error-handler');
const UserValidator = require('../middlewares/user-validator');
const authenticationMiddleware = require('../middlewares/authentication');

class UsersRouter {
    static route(expressApp) {
        let router = expressApp.Router();

        router.post('/:address', ErrorHandlers.globalErrorHandler(usersController.generateNonce));

        router.post('/:address/verify-signature', ErrorHandlers.globalErrorHandler(usersController.verifySignature));

        router.post(
            '/:supplyID/buy',
            ErrorHandlers.globalErrorHandler(authenticationMiddleware.authenticateToken),
            ErrorHandlers.globalErrorHandler(UserValidator.ValidateMetadata),
            ErrorHandlers.globalErrorHandler(usersController.commitToBuy)
        );

        return router;
    }
}

module.exports = UsersRouter;
