/* API Version - 2.1.3 */

function ColorValueChangedCallback() {}

ColorValueChangedCallback.prototype = new ValueChangedCallback();
ColorValueChangedCallback.prototype.constructor = ColorValueChangedCallback;

/**
 * @param {float} red
 * @param {float} green
 * @param {float} blue
 */
ColorValueChangedCallback.prototype.valueChanged = function(red, green, blue) {};
