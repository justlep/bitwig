/* API Version - 2.1.3 */

/**
 * Instances of this interface represent beat time values.
 *
 * @since API version 1
 */
function BeatTimeValue() {}

BeatTimeValue.prototype = new DoubleValue();
BeatTimeValue.prototype.constructor = BeatTimeValue;

/**
 * Gets the current beat time formatted according to the supplied formatter.
 *
 * @param {BeatTimeFormatter} formatter
 * @return {string}
 * @since API version 2
 */
BeatTimeValue.prototype.getFormatted = function(formatter) {};

/**
 * Gets the current beat time formatted according to the default beat time formatter.
 *
 * @return {string}
 * @since API version 2
 */
BeatTimeValue.prototype.getFormatted = function() {};
