/* API Version - 2.2 */

/**
 * Instances of this interface represent a TCP socket that other network clients can connect to, typically
 * created by calling {@link ControllerHost#createRemoteConnection}.
 *
 * @see {@link ControllerHost#createRemoteConnection}
 * @since API version 1
 */
function RemoteSocket() {}

/**
 * Sets a callback which receives a remote connection object for each incoming connection.
 *
 * @param callback
          a callback function which receives a single {@link RemoteConnection} argument
 * @since API version 1
 */
RemoteSocket.prototype.setClientConnectCallback = function(callback) {};

/**
 * Gets the actual port used for the remote socket, which might differ from the originally requested port
 * when calling {@link ControllerHost#createRemoteConnection(String name, int port)} in case the requested port was
 * already used.
 *
 * @return {int} the actual port used for the remote socket
 * @since API version 1
 */
RemoteSocket.prototype.getPort = function() {};
