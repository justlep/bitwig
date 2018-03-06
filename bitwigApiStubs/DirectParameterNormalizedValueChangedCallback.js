/* API Version - 2.3.1 */

function DirectParameterNormalizedValueChangedCallback() {}

DirectParameterNormalizedValueChangedCallback.prototype = new Callback();
DirectParameterNormalizedValueChangedCallback.prototype.constructor = DirectParameterNormalizedValueChangedCallback;

/**
 * @param {string} id
 * @param {double} normalizedValue
 */
DirectParameterNormalizedValueChangedCallback.prototype.directParameterNormalizedValueChanged = function(id, normalizedValue) {};
