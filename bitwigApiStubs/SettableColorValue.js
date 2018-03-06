/* API Version - 2.3.1 */

function SettableColorValue() {}

SettableColorValue.prototype = new ColorValue();
SettableColorValue.prototype.constructor = SettableColorValue;

/**
 * Sets the internal value.
 *
 * @param {float} red
 * @param {float} green
 * @param {float} blue
 * @since API version 2
 */
SettableColorValue.prototype.set = function(red, green, blue) {};

/**
 * Sets the internal value.
 *
 * @param {float} red
 * @param {float} green
 * @param {float} blue
 * @param {float} alpha
 * @since API version 5
 */
SettableColorValue.prototype.set = function(red, green, blue, alpha) {};
