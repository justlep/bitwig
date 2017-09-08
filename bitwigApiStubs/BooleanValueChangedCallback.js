/* API Version - 2.1.3 */

function BooleanValueChangedCallback() {}

BooleanValueChangedCallback.prototype = new ValueChangedCallback();
BooleanValueChangedCallback.prototype.constructor = BooleanValueChangedCallback;

/**
 * @param {boolean} newValue
 */
BooleanValueChangedCallback.prototype.valueChanged = function(newValue) {};
