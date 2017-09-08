/* API Version - 2.1.3 */

/**
 * Instances of this interface represent ranged parameters that can be controlled with automation in Bitwig
 * Studio.
 *
 * @since API version 1
 */
function Parameter() {}

Parameter.prototype = new SettableRangedValue();
Parameter.prototype.constructor = Parameter;

/**
 * Gets the current value of this parameter.
 *
 * @return {SettableRangedValue}
 * @since API version 2
 */
Parameter.prototype.value = function() {};

/**
 * Gets the modulated value of this parameter.
 *
 * @return {RangedValue}
 * @since API version 2
 */
Parameter.prototype.modulatedValue = function() {};

/**
 * The name of the parameter.
 *
 * @return {StringValue}
 * @since API version 2
 */
Parameter.prototype.name = function() {};

/**
 * Resets the value to its default.
 *
 * @since API version 1
 */
Parameter.prototype.reset = function() {};

/**
 * Touch (or un-touch) the value for automation recording.
 *
 * @param isBeingTouched
          `true` for touching, `false` for un-touching
 * @since API version 1
 */
Parameter.prototype.touch = function(isBeingTouched) {};

/**
 * Specifies if this value should be indicated as mapped in Bitwig Studio, which is visually shown as
 * colored dots or tinting on the parameter controls.
 *
 * @param shouldIndicate
          `true` in case visual indications should be shown in Bitwig Studio, `false` otherwise
 * @since API version 1
 */
Parameter.prototype.setIndication = function(shouldIndicate) {};

/**
 * Specifies a label for the mapped hardware parameter as shown in Bitwig Studio, for example in menu items
 * for learning controls.
 *
 * @param label
          the label to be shown in Bitwig Studio
 * @since API version 1
 */
Parameter.prototype.setLabel = function(label) {};

/**
 * Restores control of this parameter to automation playback.
 *
 * @since API version 1
 */
Parameter.prototype.restoreAutomationControl = function() {};
