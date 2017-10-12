/* API Version - 2.2 */

/**
 * Instances of this interface represent enumeration values. Enum values work similar to string values, but
 * are limited to a fixed set of value options.
 *
 * @since API version 1
 */
function SettableEnumValue() {}

SettableEnumValue.prototype = new EnumValue();
SettableEnumValue.prototype.constructor = SettableEnumValue;

/**
 * Sets the value to the enumeration item with the given name.
 *
 * @param name
          the name of the new enum item
 * @since API version 1
 */
SettableEnumValue.prototype.set = function(value) {};
