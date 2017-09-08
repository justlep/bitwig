/* API Version - 2.1.3 */

function ShortMidiMessage() {}

/**
 * @return {int}
 */
ShortMidiMessage.prototype.getStatusByte = function() {};

/**
 * @return {int}
 */
ShortMidiMessage.prototype.getData1 = function() {};

/**
 * @return {int}
 */
ShortMidiMessage.prototype.getData2 = function() {};

/**
 * @return {int}
 */
ShortMidiMessage.prototype.getChannel = function() {};

/**
 * @return {int}
 */
ShortMidiMessage.prototype.getStatusMessage = function() {};

/**
 * @return {boolean}
 */
ShortMidiMessage.prototype.isNoteOff = function() {};

/**
 * @return {boolean}
 */
ShortMidiMessage.prototype.isNoteOn = function() {};

/**
 * @return {boolean}
 */
ShortMidiMessage.prototype.isPolyPressure = function() {};

/**
 * @return {boolean}
 */
ShortMidiMessage.prototype.isControlChange = function() {};

/**
 * @return {boolean}
 */
ShortMidiMessage.prototype.isProgramChange = function() {};

/**
 * @return {boolean}
 */
ShortMidiMessage.prototype.isChannelPressure = function() {};
