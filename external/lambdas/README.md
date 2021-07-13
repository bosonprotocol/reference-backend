# Triggers

#TODO 
All configs and utils are the same! They must exist only once, but due to the lambdas being compressed with all their dependencies they need to be in the folder where all other codebase is. This should be avoided in future.


Trigger functions check all records that we have in the DB whether an admin / executor should trigger particular status of a voucher. They are responsible for triggering the expiration, finalization and distribution of payments and deposits when certain conditions are met.


### Local Development
In order to run the triggers locally you would need to have your contracts deployed on a local RPC. Then you should go in:

* triggerExpirations/src/config.js
* triggerFinalizations/src/config.js
* triggerWithdrawals/src/config.js

and apply all necessary information in the local configs function.

Once that has been set you would need to go in:

* triggerExpirations/src/index.js
* triggerFinalizations/src/index.js
* triggerWithdrawals/src/index.js

and instead of:

```javascript
const config = await getConfigParams(SecretIdDev, "dev");
```

replace with:
```javascript
const config = await getConfigParams(SecretIdDev, "local");
```

### Run
```shell
npm run start:local:triggers
```