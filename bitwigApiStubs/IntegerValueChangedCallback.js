/* API Version - 2.2 */

function IntegerValueChangedCallback() {}

IntegerValueChangedCallback.prototype = new ValueChangedCallback();
IntegerValueChangedCallback.prototype.constructor = IntegerValueChangedCallback;

/**
 * @param {int} newValue
 */
IntegerValueChangedCallback.prototype.valueChanged = function(newValue) {};
