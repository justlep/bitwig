/* API Version - 2.1.3 */

function FloatValueChangedCallback() {}

FloatValueChangedCallback.prototype = new Callback();
FloatValueChangedCallback.prototype.constructor = FloatValueChangedCallback;

/**
 * @param {float} newValue
 */
FloatValueChangedCallback.prototype.valueChanged = function(newValue) {};
