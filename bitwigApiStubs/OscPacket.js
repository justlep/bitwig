/* API Version - 2.3.1 */

/**
 * Base class for OscPackets.
 *
 * @since API version 5
 */
function OscPacket() {}

/**
 * If the message was part of a bundle, get a pointer back to it.
 * If not, this methods returns null.
 *
 * @return {OscBundle}
 */
OscPacket.prototype.getParentBundle = function() {};
