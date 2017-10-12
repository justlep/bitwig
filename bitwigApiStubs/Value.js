/* API Version - 2.2 */

/**
 * The common interface that is shared by all value objects in the controller API.
 *
 * @since API version 1
 */
function Value() {}

Value.prototype = new Subscribable();
Value.prototype.constructor = Value;

/**
 * Marks this value as being of interest to the driver. This can only be called once during the driver's
 * init method. A value that is of interest to the driver can be obtained using the value's get method. If
 * a value has not been marked as interested then an error will be reported if the driver attempts to get
 * the current value. Adding an observer to a value will automatically mark this value as interested.
 *
 * @since API version 2
 */
Value.prototype.markInterested = function() {};

/**
 * Registers an observer that reports the current value.
 *
 * @param callback
          a callback function that receives a single parameter
 * @since API version 1
 */
Value.prototype.addValueObserver = function(callback) {};
