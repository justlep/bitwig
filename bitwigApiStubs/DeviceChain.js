/* API Version - 2.2.3 */

/**
 * The foundation of all interfaces that contain devices, such as tracks, device layers, drum pads or FX
 * slots.
 *
 * @since API version 1
 */
function DeviceChain() {}

DeviceChain.prototype = new ObjectProxy();
DeviceChain.prototype.constructor = DeviceChain;

/**
 * Selects the device chain in Bitwig Studio, in case it is a selectable object.
 *
 * @since API version 1
 */
DeviceChain.prototype.selectInEditor = function() {};

/**
 * Value that reports the name of the device chain, such as the track name or the drum pad
 * name.
 *
 * @return {SettableStringValue}
 * @since API version 2
 */
DeviceChain.prototype.name = function() {};

/**
 * Registers an observer that reports if the device chain is selected in Bitwig Studio editors.
 *
 * @param callback
          a callback function that takes a single boolean parameter.
 * @since API version 1
 */
DeviceChain.prototype.addIsSelectedInEditorObserver = function(callback) {};

/**
 * Returns an object that provides bank-wise navigation of devices.
 *
 * @param numDevices
          the number of devices should be accessible simultaneously
 * @return {DeviceBank} the requested device bank object
@since API version 1
 */
DeviceChain.prototype.createDeviceBank = function(numDevices) {};

/**
 * Returns an object used for browsing devices, presets and other content. Committing the browsing session
 * will load or create a device from the selected resource and insert it into the device chain.
 *
 * @param numFilterColumnEntries
          the size of the window used to navigate the filter column entries.
 * @param numResultsColumnEntries
          the size of the window used to navigate the results column entries.
 * @return {Browser} the requested device browser object.
 * @since API version 1
 */
DeviceChain.prototype.createDeviceBrowser = function(numFilterColumnEntries, numResultsColumnEntries) {};

/**
 * Starts browsing for content that can be inserted at the start of this device chain.
 *
 * @since API version 2
 */
DeviceChain.prototype.browseToInsertAtStartOfChain = function() {};

/**
 * Starts browsing for content that can be inserted at the end of this device chain.
 *
 * @since API version 2
 */
DeviceChain.prototype.browseToInsertAtEndOfChain = function() {};
