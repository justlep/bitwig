/* API Version - 2.2.3 */

function DoubleValueChangedCallback() {}

DoubleValueChangedCallback.prototype = new ValueChangedCallback();
DoubleValueChangedCallback.prototype.constructor = DoubleValueChangedCallback;

/**
 * @param {double} newValue
 */
DoubleValueChangedCallback.prototype.valueChanged = function(newValue) {};
