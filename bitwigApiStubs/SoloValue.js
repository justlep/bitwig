/* API Version - 2.1.3 */

/**
 * Instances of this interface represent the state of a solo button.
 *
 * @since API version 1
 */
function SoloValue() {}

SoloValue.prototype = new SettableBooleanValue();
SoloValue.prototype.constructor = SoloValue;

/**
 * Toggles the current solo state.
 *
 * @param exclusive
          specifies if solo on other channels should be disabled automatically ('true') or not
          ('false').
 * @since API version 1
 */
SoloValue.prototype.toggle = function(exclusive) {};
