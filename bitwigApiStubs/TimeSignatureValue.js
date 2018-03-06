/* API Version - 2.3.1 */

/**
 * Instances of this interface represent time signature values.
 *
 * @since API version 1
 */
function TimeSignatureValue() {}

TimeSignatureValue.prototype = new Value();
TimeSignatureValue.prototype.constructor = TimeSignatureValue;

/**
 * Gets the current value.
 *
 * @return {string}
 * @since API version 2
 */
TimeSignatureValue.prototype.get = function() {};

/**
 * Updates the time signature according to the given string.
 *
 * @param name
          a textual representation of the new time signature value, formatted as
          `numerator/denominator[, ticks]`
 * @since API version 1
 */
TimeSignatureValue.prototype.set = function(name) {};

/**
 * Returns an object that provides access to the time signature numerator.
 *
 * @return {SettableIntegerValue} an integer value object that represents the time signature numerator.
 * @since API version 5
 */
TimeSignatureValue.prototype.numerator = function() {};

/**
 * Returns an object that provides access to the time signature denominator.
 *
 * @return {SettableIntegerValue} an integer value object that represents the time signature denominator.
 * @since API version 5
 */
TimeSignatureValue.prototype.denominator = function() {};

/**
 * Returns an object that provides access to the time signature tick subdivisions.
 *
 * @return {SettableIntegerValue} an integer value object that represents the time signature ticks.
 * @since API version 5
 */
TimeSignatureValue.prototype.ticks = function() {};
