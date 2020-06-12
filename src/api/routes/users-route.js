const usersController = require('../controllers/users-controller');
const ErrorHandlers = require('../middlewares/error-handler');
const dbService = require('../../database/database-service') 
const authMiddleware = require('../middlewares/authorization');

class UsersRouter {

    static route(expressApp) {
        let router = expressApp.Router();

        router.post('/:address', 
            ErrorHandlers.globalErrorHandler(usersController.generateNonce),
            ErrorHandlers.globalErrorHandler(dbService.preserveNonce));

        router.post('/:address/verify-signature', 
            ErrorHandlers.globalErrorHandler(dbService.getNonce),
            ErrorHandlers.globalErrorHandler(usersController.verifySignature),
            ErrorHandlers.globalErrorHandler(authMiddleware.authorize))

        return router;
    }
}

module.exports = UsersRouter;
