/* API Version - 2.2.3 */

function BooleanValueChangedCallback() {}

BooleanValueChangedCallback.prototype = new ValueChangedCallback();
BooleanValueChangedCallback.prototype.constructor = BooleanValueChangedCallback;

/**
 * @param {boolean} newValue
 */
BooleanValueChangedCallback.prototype.valueChanged = function(newValue) {};
