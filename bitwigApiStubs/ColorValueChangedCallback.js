/* API Version - 2.3.1 */

function ColorValueChangedCallback() {}

ColorValueChangedCallback.prototype = new ValueChangedCallback();
ColorValueChangedCallback.prototype.constructor = ColorValueChangedCallback;

/**
 * As alpha component was introduced after this interface was released,
 * the alpha component is not part of the parameter and would have to be
 * checked manually.
 *
 * @param {float} red
 * @param {float} green
 * @param {float} blue
 */
ColorValueChangedCallback.prototype.valueChanged = function(red, green, blue) {};
