/* API Version - 2.3.1 */

/**
 * An OSC message.
 *
 * @since API version 5
 */
function OscMessage() {}

OscMessage.prototype = new OscPacket();
OscMessage.prototype.constructor = OscMessage;

/**
 * @return {string}
 */
OscMessage.prototype.getAddressPattern = function() {};

/**
 * @return {string}
 */
OscMessage.prototype.getTypeTag = function() {};

/**
 * @return {java.util.List<java.lang.Object>}
 */
OscMessage.prototype.getArguments = function() {};

/**
 * @param {int} index
 * @return {string}
 */
OscMessage.prototype.getString = function(index) {};

/**
 * @param {int} index
 * @return {byte[]}
 */
OscMessage.prototype.getBlob = function(index) {};

/**
 * @param {int} index
 * @return {java.lang.Integer}
 */
OscMessage.prototype.getInt = function(index) {};

/**
 * @param {int} index
 * @return {java.lang.Long}
 */
OscMessage.prototype.getLong = function(index) {};

/**
 * @param {int} index
 * @return {java.lang.Float}
 */
OscMessage.prototype.getFloat = function(index) {};

/**
 * @param {int} index
 * @return {java.lang.Double}
 */
OscMessage.prototype.getDouble = function(index) {};

/**
 * @param {int} index
 * @return {java.lang.Boolean}
 */
OscMessage.prototype.getBoolean = function(index) {};
