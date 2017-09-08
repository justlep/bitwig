/* API Version - 2.1.3 */

function BooleanValue() {}

BooleanValue.prototype = new Value();
BooleanValue.prototype.constructor = BooleanValue;

/**
 * Gets the current value.
 *
 * @return {boolean}
 * @since API version 2
 */
BooleanValue.prototype.get = function() {};
