/* API Version - 2.3.1 */

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
 * Gets the green component of the current value.
 *
 * @return {float}
 * @since API version 2
 */
ColorValue.prototype.green = function() {};

/**
 * Gets the blue component of the current value.
 *
 * @return {float}
 * @since API version 2
 */
ColorValue.prototype.blue = function() {};

/**
 * Gets the alpha component of the current value.
 *
 * @return {float}
 * @since API version 5
 */
ColorValue.prototype.alpha = function() {};
