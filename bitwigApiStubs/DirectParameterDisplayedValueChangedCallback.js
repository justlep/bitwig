/* API Version - 2.3.1 */

function DirectParameterDisplayedValueChangedCallback() {}

DirectParameterDisplayedValueChangedCallback.prototype = new Callback();
DirectParameterDisplayedValueChangedCallback.prototype.constructor = DirectParameterDisplayedValueChangedCallback;

/**
 * @param {string} id
 * @param {string} value
 */
DirectParameterDisplayedValueChangedCallback.prototype.directParameterDisplayedValueChanged = function(id, value) {};
