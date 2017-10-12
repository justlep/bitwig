/* API Version - 2.2 */

/**
 * Instances of this interface are reported to the supplied script callback when connecting to a remote TCP
 * socket via {@link ControllerHost#connectToRemoteHost}.
 *
 * @see {@link ControllerHost#connectToRemoteHost}
 * @since API version 1
 */
function RemoteConnection() {}

/**
 * Disconnects from the remote host.
 *
 * @since API version 1
 */
RemoteConnection.prototype.disconnect = function() {};

/**
 * Registers a callback function that gets called when the connection gets lost or disconnected.
 *
 * @param callback
          a callback function that doesn't receive any parameters
 * @since API version 1
 */
RemoteConnection.prototype.setDisconnectCallback = function(callback) {};

/**
 * Sets the callback used for receiving data.
 * 
 * The remote connection needs a header for each message sent to it containing a 32-bit big-endian integer
 * saying how big the rest of the message is. The data delivered to the script will not include this
 * header.
 *
 * @param callback
          a callback function with the signature `(byte[] data)`
 * @since API version 1
 */
RemoteConnection.prototype.setReceiveCallback = function(callback) {};

/**
 * Sends data to the remote host.
 *
 * @param data
          the byte array containing the data to be sent. When creating a numeric byte array in
          JavaScript, the byte values must be signed (in the range -128..127).
 * @throws IOException
 * @since API version 1
 */
RemoteConnection.prototype.send = function(data) {};
