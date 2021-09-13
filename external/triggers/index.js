
const triggerExpirations = require('./src/triggerExpirations').handler;
const triggerFinalizations = require('./src/triggerFinalizations').handler;
const triggerWithdrawals = require('./src/triggerWithdrawals').handler;
const getConfigs = require('./config');

async function run() {
    const configs = await getConfigs("cloud")

    triggerExpirations(configs)
    triggerFinalizations(configs)
    triggerWithdrawals(configs)
}

run();
