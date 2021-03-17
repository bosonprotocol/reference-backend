const events = require('./events');

(() => {
    console.log("Event Listeners started...");
    
    events.init();

    events.run()
})();