/* API Version - 2.3.1 */

function IntegerValue() {}

IntegerValue.prototype = new Value();
IntegerValue.prototype.constructor = IntegerValue;

/**
 * Gets the current value.
 *
 * @return {int}
 * @since API version 2
 */
IntegerValue.prototype.get = function() {};

/**
 * Adds an observer that is notified when this value changes. This is intended to aid in backwards
 * compatibility for drivers written to the version 1 API.
 *
 * @param callback
          The callback to notify with the new value
 * @param valueWhenUnassigned
          The value that the callback will be notified with if this value is not currently assigned to
          anything.
 */
IntegerValue.prototype.addValueObserver = function(callback, valueWhenUnassigned) {};
