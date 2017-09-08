/* API Version - 2.1.3 */

function DirectParameterNormalizedValueChangedCallback() {}

DirectParameterNormalizedValueChangedCallback.prototype = new Callback();
DirectParameterNormalizedValueChangedCallback.prototype.constructor = DirectParameterNormalizedValueChangedCallback;

/**
 * @param {string} id
 * @param {double} normalizedValue
 */
DirectParameterNormalizedValueChangedCallback.prototype.directParameterNormalizedValueChanged = function(id, normalizedValue) {};
