/* API Version - 2.2.3 */

function SettableDoubleValue() {}

SettableDoubleValue.prototype = new DoubleValue();
SettableDoubleValue.prototype.constructor = SettableDoubleValue;

/**
 * Sets the internal value.
 *
 * @param value
          the new integer value.
 * @since API version 1
 */
SettableDoubleValue.prototype.set = function(value) {};

/**
 * Increases/decrease the internal value by the given amount.
 *
 * @param amount
          the integer amount to increase
 * @since API version 1
 */
SettableDoubleValue.prototype.inc = function(amount) {};
