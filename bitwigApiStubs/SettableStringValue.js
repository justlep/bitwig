/* API Version - 2.2.3 */

/**
 * Instances of this interface implement the {@link Value} interface for string values.
 *
 * @since API version 1
 */
function SettableStringValue() {}

SettableStringValue.prototype = new StringValue();
SettableStringValue.prototype.constructor = SettableStringValue;

/**
 * Sets the value object to the given string.
 *
 * @param value
          the new value string
 * @since API version 1
 */
SettableStringValue.prototype.set = function(value) {};
