/* API Version - 2.3.1 */

/**
 * @since API version 2
 */
function SettableStringArrayValue() {}

SettableStringArrayValue.prototype = new StringArrayValue();
SettableStringArrayValue.prototype.constructor = SettableStringArrayValue;

/**
 * Sets the internal value.
 *
 * @param value
          the new value.
 * @since API version 2
 */
SettableStringArrayValue.prototype.set = function(value) {};
