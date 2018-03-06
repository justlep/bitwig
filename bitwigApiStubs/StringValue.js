/* API Version - 2.3.1 */

function StringValue() {}

StringValue.prototype = new Value();
StringValue.prototype.constructor = StringValue;

/**
 * Gets the current value.
 *
 * @return {string}
 * @since API version 2
 */
StringValue.prototype.get = function() {};

/**
 * Gets the current value and tries to intelligently limit it to the supplied length in the best way
 * possible.
 *
 * @param {int} maxLength
 * @return {string}
 * @since API version 2
 */
StringValue.prototype.getLimited = function(maxLength) {};
