# Lime API Skeleton

*This skeleton API allows to quickly build up a RESTful Node.js API following the best practices, while no need to worry about the project structure. In this project you will encounter everything ready and set up - you only need to apply your logic inside.*

## Quick start guide
```
npm install
node app
```

## Project structure

* ``` app.js ``` - entrypoint of the API
* ``` src/utils.js ``` - should contain all the useful functions that are reused several times in the Service
* ``` src/api/controllers/* ``` - example usage of controllers
* ``` src/api/middleware/* ``` - example usage of midllewares like authentication, error handling and middleware as a whole
* ``` src/api/routes/* ``` - example usage of routes, wrapped with middlewares, which should call different type of errors produced by the controller. Contains the definition of the routes you will be calling
* ``` src/api/api-error.js ```- standard error class which serves the errors thrown by the API
* ``` src/api/clients/* ``` - template of Client Interfaces exposing wrapped API of any third party we would need. Each and every 3rd party interface should be stored in a separate file for it's own functionalities.
* ``` src/api/database/database-service.js ``` - This should be very simple service containing short functions only with the CRUD interactions to a database
* ``` src/api/database/collections.json ``` - Any constants like collecton/table names should go in this file



## Routes

``` / ```   
``` /examples ```   
``` /examples/:id ```   
``` /errors/apierror ```   
``` /errors/globalerror ```   
The routes are just representation of how all the project work in synergy. There are examples of post/get requests which display different raw information to the client on several scenarios. You could also see some of the potential errors you could receive and how to handle them properly.



#### Some other best practices and useful information which should be taken into consideration while building an API of your own.
* while trying to acess/transfer data between middlewares you should take into consideration the **res.locals** property. Here you could store all your local variables scoped to the request. It is useful for exposing request-level information such as the request path name, authenticated user, user settings, and so on.
* error handling - in most of the cases you should be aware what possible outcomes the scenario holds and should handle them properly with the **ApiError** class, providing meaningful error code and description. It is also good idea to wrap the controller with the globalErrorHandler middleware which will return *internal server error* in unpredicted scenario, or error thrown outside our API. The globalErrorHandler will display the *error.stack* so you will be aware of what went wrong.
