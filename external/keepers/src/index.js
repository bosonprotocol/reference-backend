const events = require('./events');

(async () => {
    console.log("Event Listeners started...");
    
    events.init();

    await events.run()
})();