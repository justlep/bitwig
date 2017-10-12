/* API Version - 2.2 */

/**
 * Instances of this interface are special kind of channel objects that represent the pads of a drum machine
 * instrument. Drum pads are typically associated to channel objects via note keys.
 *
 * @since API version 1
 */
function DrumPad() {}

DrumPad.prototype = new Channel();
DrumPad.prototype.constructor = DrumPad;
