/* API Version - 2.2.3 */

/**
 * Instances of this interface represent nested FX slots in devices.
 *
 * @since API version 1
 */
function DeviceSlot() {}

DeviceSlot.prototype = new DeviceChain();
DeviceSlot.prototype.constructor = DeviceSlot;
