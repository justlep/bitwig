/* API Version - 2.2.3 */

/**
 * @since API version 2
 */
function StringArrayValue() {}

StringArrayValue.prototype = new ObjectArrayValue();
StringArrayValue.prototype.constructor = StringArrayValue;

/**
 * Gets the current value.
 *
 * @return {String[]}
 * @since API version 2
 */
StringArrayValue.prototype.get = function() {};
