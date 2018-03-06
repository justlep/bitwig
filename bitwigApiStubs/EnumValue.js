/* API Version - 2.3.1 */

function EnumValue() {}

EnumValue.prototype = new Value();
EnumValue.prototype.constructor = EnumValue;

/**
 * Gets the current value.
 *
 * @return {string}
 * @since API version 2
 */
EnumValue.prototype.get = function() {};
