/* API Version - 2.3.1 */

/**
 * An OSC Bundle.
 *
 * @since API version 5
 */
function OscBundle() {}

OscBundle.prototype = new OscPacket();
OscBundle.prototype.constructor = OscBundle;

/**
 * @return {long}
 */
OscBundle.prototype.getNanoseconds = function() {};

/**
 * @return {java.util.List<OscPacket>}
 */
OscBundle.prototype.getPackets = function() {};
