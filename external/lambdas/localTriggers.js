const triggerInterval = 600000; //10 minutes in millis
const finalizationTrigger = require('./triggerFinalizations/src/index').handler;
const withdrawalsTrigger = require('./triggerWithdrawals/src/index').handler;
const expiryTrigger = require('./triggerExpirations/src/index').handler;

setInterval(() => {
    finalizationTrigger();
    withdrawalsTrigger();
    expiryTrigger();
}, triggerInterval);
