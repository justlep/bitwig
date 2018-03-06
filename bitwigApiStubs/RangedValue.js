/* API Version - 2.3.1 */

/**
 * Instances of this interface represent numeric values that have an upper and lower limit.
 *
 * @since API version 1
 */
function RangedValue() {}

RangedValue.prototype = new Value();
RangedValue.prototype.constructor = RangedValue;

/**
 * The current value normalized between 0..1 where 0 represents the minimum value and 1 the maximum.
 *
 * @return {double}
 * @since API version 2
 */
RangedValue.prototype.get = function() {};

/**
 * Gets the current value.
 *
 * @return {double}
 * @since API version 2
 */
RangedValue.prototype.getRaw = function() {};

/**
 * Value that represents a formatted text representation of the value whenever the value changes.
 *
 * @return {StringValue}
 * @since API version 2
 */
RangedValue.prototype.displayedValue = function() {};

/**
 * Adds an observer which receives the normalized value of the parameter as an integer number within the
 * range [0..range-1].
 *
 * @param range
          the range used to scale the value when reported to the callback
 * @param callback
          a callback function that receives a single double parameter
 * @since API version 1
 */
RangedValue.prototype.addValueObserver = function(range, callback) {};

/**
 * Add an observer which receives the internal raw of the parameter as floating point.
 *
 * @param callback
          a callback function that receives a single numeric parameter with double precision.
 * @since API version 1
 */
RangedValue.prototype.addRawValueObserver = function(callback) {};
