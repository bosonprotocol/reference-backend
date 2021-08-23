let socketConnections;

const setSocketConnections = (newSocketConnections) => {
    socketConnections = newSocketConnections;
}

const getSocketConnections = (thread) => {
    if (socketConnections) return socketConnections.get(thread);
}

module.exports = {
    setSocketConnections,
    getSocketConnections
}