const { getSocketConnections } = require("../../utils/socketConnections");

class SlackEventsController {

    async messageEventListenerSlack(req, res) {
        
        const NEW_CHAT_MESSAGE_EVENT = "message";
        const message = req.body;
        const thread = message.event.thread_ts;

        res.sendStatus(200);

        if (message.challenge) {

            res.send(message.challenge);

        } else if (message.event.type === 'message' && message.event.subtype !== 'message_changed') {

            if (!message.event.subtype) {

                const socketConnectionInstance = getSocketConnections(thread);
                const formattedMessage = this.formatMessage(message);
              
                if (socketConnectionInstance) {

                    socketConnectionInstance
                        .in(thread)
                        .emit(NEW_CHAT_MESSAGE_EVENT, [formattedMessage]);

                }

            }
        }

    }

    formatMessage(message) {
        return {
            type: "SELLER",
            account: message.username,
            timestamp: new Date(parseInt(message.event_time) * 1000),
            message: message.event.text,
        };
    }

}

module.exports = SlackEventsController;
