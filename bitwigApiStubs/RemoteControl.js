/* API Version - 2.3.1 */

/**
 * Represents a remote control in Bitwig Studio.
 *
 * @sice API version 2
 */
function RemoteControl() {}

RemoteControl.prototype = new Parameter();
RemoteControl.prototype.constructor = RemoteControl;

/**
 * @return {SettableStringValue}
 */
RemoteControl.prototype.name = function() {};
