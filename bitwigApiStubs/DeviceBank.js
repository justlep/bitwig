/* API Version - 2.2.3 */

/**
 * This interface is used for navigation of device chains in Bitwig Studio. Instances are configured with a
 * fixed number of devices and provide access to a excerpt of the devices inside a device chain. Various
 * methods are provided for scrolling to different sections of the device chain. It basically acts like a
 * window moving over the devices.
 * 
 * To receive an instance of DeviceBank call {@link Track#createDeviceBank}.
 *
 * @see {@link Track#createDeviceBank}
 * @since API version 1
 */
function DeviceBank() {}

DeviceBank.prototype = new Bank();
DeviceBank.prototype.constructor = DeviceBank;

/**
 * Returns the object that was used to instantiate this device bank. Possible device chain instances are
 * tracks, device layers, drums pads, or FX slots.
 *
 * @return {DeviceChain} the requested device chain object
 * @since API version 1
 */
DeviceBank.prototype.getDeviceChain = function() {};

/**
 * Returns the device at the given index within the bank.
 *
 * @param indexInBank
          the device index within this bank, not the position within the device chain. Must be in the
          range [0..sizeOfBank-1].
 * @return {Device} the requested device object
 * @since API version 1
 */
DeviceBank.prototype.getDevice = function(indexInBank) {};

/**
 * Scrolls the device window one page up.
 *
 * @since API version 1
 */
DeviceBank.prototype.scrollPageUp = function() {};

/**
 * Scrolls the device window one page down.
 *
 * @since API version 1
 */
DeviceBank.prototype.scrollPageDown = function() {};

/**
 * Scrolls the device window one device up.
 *
 * @since API version 1
 */
DeviceBank.prototype.scrollUp = function() {};

/**
 * Scrolls the device window one device down.
 *
 * @since API version 1
 */
DeviceBank.prototype.scrollDown = function() {};

/**
 * Makes the device with the given position visible in the track bank.
 *
 * @param position
          the position of the device within the device chain
 * @since API version 1
 */
DeviceBank.prototype.scrollTo = function(position) {};

/**
 * Registers an observer that reports if the device window can be scrolled further down.
 *
 * @param callback
          a callback function that takes a single boolean parameter
 * @since API version 1
 */
DeviceBank.prototype.addCanScrollDownObserver = function(callback) {};

/**
 * Browses for content to insert a device at the given index inside this bank.
 *
 * @param index
          the index to insert the device at. Must be >= 0 and <= {@link #getSizeOfBank()}.
 * @since API version 2
 */
DeviceBank.prototype.browseToInsertDevice = function(index) {};
