/* API Version - 2.3.1 */

/**
 * This interface lets you send OscMessage through an connection which can be via Tcp, Udp, or whatever.
 * 
 * OscPackets are sent when all the startBundle() have a matching endBundle().
 * If you call sendMessage() with startBundle() before, then the message will be sent directly.
 * 
 * Our maximum packet size is 64K.
 *
 * @since API version 5
 */
function OscConnection() {}

/**
 * Starts an OscBundle.
 *
 * @throws IOException
 */
OscConnection.prototype.startBundle = function() {};

/**
 * Supported object types:
 * - Integer for int32
 * - Long for int64
 * - Float for float
 * - Double for double
 * - null for nil
 * - Boolean for true and false
 * - String for string
 * - byte[] for blob
 *
 * @param {string} address
 * @param {Object} args
 * @throws IOException
 * @throws OscInvalidArgumentTypeException
 */
OscConnection.prototype.sendMessage = function(address, /*...*/args) {};

/**
 * Finishes the previous bundle, and if it was not inside an other bundle, it will send the message
 * directly.
 *
 * @throws IOException
 */
OscConnection.prototype.endBundle = function() {};
