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
            ErrorHandlers.globalErrorHandler(authMiddleware.verifySignature),
            ErrorHandlers.globalErrorHandler(authMiddleware.generateAccessToken))

        router.post('/:address/buy',
            ErrorHandlers.globalErrorHandler(authMiddleware.authenticateToken),
            ErrorHandlers.globalErrorHandler(usersController.buy),
            ErrorHandlers.globalErrorHandler(dbService.buy))

        
        return router;
    }
}

module.exports = UsersRouter;
