/* API Version - 2.1.3 */

function ColorValue() {}

ColorValue.prototype = new Value();
ColorValue.prototype.constructor = ColorValue;

/**
 * Gets the red component of the current value.
 *
 * @return {float}
 * @since API version 2
 */
ColorValue.prototype.red = function() {};

/**
 * Gets the red component of the current value.
 *
 * @return {float}
 * @since API version 2
 */
ColorValue.prototype.green = function() {};

/**
 * Gets the red component of the current value.
 *
 * @return {float}
 * @since API version 2
 */
ColorValue.prototype.blue = function() {};
