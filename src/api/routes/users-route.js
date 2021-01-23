const usersController = require('../controllers/users-controller');
const ErrorHandlers = require('../middlewares/error-handler');

class UsersRouter {

    static route(expressApp) {
        let router = expressApp.Router();

        router.post('/:address',
            ErrorHandlers.globalErrorHandler(usersController.generateNonce));

        router.post('/:address/verify-signature', 
            ErrorHandlers.globalErrorHandler(usersController.verifySignature))

        return router;
    }
}

module.exports = UsersRouter;
