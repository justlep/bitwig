/* API Version - 2.2 */

function EnumValueChangedCallback() {}

EnumValueChangedCallback.prototype = new ObjectValueChangedCallback();
EnumValueChangedCallback.prototype.constructor = EnumValueChangedCallback;
