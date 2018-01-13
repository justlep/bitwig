/* API Version - 2.2.3 */

function ObjectValueChangedCallback() {}

ObjectValueChangedCallback.prototype = new ValueChangedCallback();
ObjectValueChangedCallback.prototype.constructor = ObjectValueChangedCallback;

/**
 * @param {ValueType} newValue
 */
ObjectValueChangedCallback.prototype.valueChanged = function(newValue) {};
