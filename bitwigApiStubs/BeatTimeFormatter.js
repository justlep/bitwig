/* API Version - 2.2.3 */

/**
 * Defines a formatter for a beat time that can convert a beat time to a string for display to the user.
 *
 * @since API version 2
 */
function BeatTimeFormatter() {}

/**
 * Formats the supplied beat time as a string in the supplied time signature.
 *
 * @param {double} beatTime
 * @param {boolean} isAbsolute
 * @param {int} timeSignatureNumerator
 * @param {int} timeSignatureDenominator
 * @param {int} timeSignatureTicks
 * @return {string}
 * @since API version 2
 */
BeatTimeFormatter.prototype.formatBeatTime = function(beatTime, isAbsolute, timeSignatureNumerator, timeSignatureDenominator, timeSignatureTicks) {};
