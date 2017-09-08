/* API Version - 2.1.3 */

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
