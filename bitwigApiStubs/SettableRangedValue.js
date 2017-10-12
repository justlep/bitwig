/* API Version - 2.2 */

/**
 * Instances of this interface represent numeric values that have an upper and lower limit.
 *
 * @since API version 1
 */
function SettableRangedValue() {}

SettableRangedValue.prototype = new RangedValue();
SettableRangedValue.prototype.constructor = SettableRangedValue;

/**
 * Sets the value in an absolute fashion as a value between 0 .. 1 where 0 represents the minimum value and
 * 1 the maximum. The value may not be set immediately if the user has configured a take over strategy for
 * the controller.
 *
 * @param value
          absolute value [0 .. 1]
 * @since API version 2
 */
SettableRangedValue.prototype.set = function(value) {};

/**
 * Sets the value in an absolute fashion as a value between 0 .. 1 where 0 represents the minimum value and
 * 1 the maximum. The value change is applied immediately and does not care about what take over mode the
 * user has selected. This is useful if the value does not need take over (e.g. a motorized slider).
 *
 * @param value
          absolute value [0 .. 1]
 * @since API version 4
 */
SettableRangedValue.prototype.setImmediately = function(value) {};

/**
 * Sets the value in an absolute fashion. The value will be scaled according to the given resolution.
 * 
 * Typically the resolution would be specified as the amount of steps the hardware control provides (for
 * example 128) and just pass the integer value as it comes from the MIDI device. The host application will
 * take care of scaling it.
 *
 * @param value
          integer number in the range [0 .. resolution-1]
 * @param resolution
          the resolution used for scaling @ if passed-in parameters are null
 * @since API version 1
 */
SettableRangedValue.prototype.set = function(value, resolution) {};

/**
 * Increments or decrements the value by a normalized amount assuming the whole range of the value is 0 ..
 * 1. For example to increment by 10% you would use 0.1 as the increment.
 *
 * @param {double} increment
 * @since API version 2
 */
SettableRangedValue.prototype.inc = function(increment) {};

/**
 * Increments or decrements the value according to the given increment and resolution parameters.
 * 
 * Typically the resolution would be specified as the amount of steps the hardware control provides (for
 * example 128) and just pass the integer value as it comes from the MIDI device. The host application will
 * take care of scaling it.
 *
 * @param increment
          the amount that the current value is increased by
 * @param resolution
          the resolution used for scaling
 * @since API version 1
 */
SettableRangedValue.prototype.inc = function(increment, resolution) {};

/**
 * Set the internal (raw) value.
 *
 * @param value
          the new value with double precision. Range is undefined.
 * @since API version 1
 */
SettableRangedValue.prototype.setRaw = function(value) {};

/**
 * Increments / decrements the internal (raw) value.
 *
 * @param delta
          the amount that the current internal value get increased by.
 * @since API version 1
 */
SettableRangedValue.prototype.incRaw = function(delta) {};
