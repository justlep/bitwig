/* API Version - 2.2 */

function StringValueChangedCallback() {}

StringValueChangedCallback.prototype = new ObjectValueChangedCallback();
StringValueChangedCallback.prototype.constructor = StringValueChangedCallback;
