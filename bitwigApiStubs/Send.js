/* API Version - 2.1.3 */

function Send() {}

Send.prototype = new Parameter();
Send.prototype.constructor = Send;

/**
 * Value that reports the color of the channel that this send sends to.
 *
 * @return {SettableColorValue}
 * @since API version 2
 */
Send.prototype.sendChannelColor = function() {};
