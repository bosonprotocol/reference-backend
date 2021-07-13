const triggerInterval = 600000; //10 minutes in millis
const finalizationTrigger = require('./triggerFinalizations/src/index').handler;
const withdrawalsTrigger = require('./triggerWithdrawals/src/index').handler;
const expiryTrigger = require('./triggerExpirations/src/index').handler;
const getLocalConfigs = require('./localConfigs')

const config = getLocalConfigs();

// Run first before running the loop
finalizationTrigger(config);
withdrawalsTrigger(config);
expiryTrigger(config);


setInterval(() => {
    finalizationTrigger(config);
    withdrawalsTrigger(config);
    expiryTrigger(config);
}, triggerInterval);
