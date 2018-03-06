/* API Version - 2.3.1 */

/**
 * This interface defines access to the common attributes and operations of cue markers.
 *
 * @since API version 2
 */
function CueMarker() {}

CueMarker.prototype = new ObjectProxy();
CueMarker.prototype.constructor = CueMarker;

/**
 * Launches playback at the marker position.
 *
 * @param {boolean} quantized Specified if the cue marker should be launched quantized or immediately
 * @since API version 2
 */
CueMarker.prototype.launch = function(quantized) {};

/**
 * Gets a representation of the marker name.
 *
 * @return {StringValue}
 * @since API version 2
 */
CueMarker.prototype.getName = function() {};

/**
 * Gets a representation of the marker color.
 *
 * @return {ColorValue}
 * @since API version 2
 */
CueMarker.prototype.getColor = function() {};
