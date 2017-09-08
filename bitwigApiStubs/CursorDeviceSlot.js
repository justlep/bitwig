/* API Version - 2.1.3 */

/**
 * Instances of this interface represent the selected device slot as shown in the Bitwig Studio user
 * interface.
 *
 * @since API version 1
 */
function CursorDeviceSlot() {}

CursorDeviceSlot.prototype = new DeviceChain();
CursorDeviceSlot.prototype.constructor = CursorDeviceSlot;

/**
 * @param {string} slot
 */
CursorDeviceSlot.prototype.selectSlot = function(slot) {};
