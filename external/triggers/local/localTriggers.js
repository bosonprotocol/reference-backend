const triggerInterval = 600000; //10 minutes in millis
const finalizationTrigger = require('../src/triggerFinalizations').handler;
const withdrawalsTrigger = require('../src/triggerWithdrawals').handler;
const expiryTrigger = require('../src/triggerExpirations').handler;
const getLocalConfigs = require('./localConfigs')

async function run() {
    const config = await getLocalConfigs();

    // Run first before running the loop
    finalizationTrigger(config);
    withdrawalsTrigger(config);
    expiryTrigger(config);

    setInterval(() => {
        finalizationTrigger(config);
        withdrawalsTrigger(config);
        expiryTrigger(config);
    }, triggerInterval);

}

run()
