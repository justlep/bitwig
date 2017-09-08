/* API Version - 2.1.3 */

/**
 * A special kind of selection cursor used for devices.
 *
 * @since API version 1
 */
function CursorDevice() {}

CursorDevice.prototype = new Cursor();
CursorDevice.prototype.constructor = CursorDevice;

/**
 * Returns the channel that this cursor device was created on. Currently this will always be a track or
 * cursor track instance.
 *
 * @return {Channel} the track or cursor track object that was used for creation of this cursor device.
 * @since API version 1
 */
CursorDevice.prototype.getChannel = function() {};

/**
 * Selects the parent device if there is any.
 *
 * @since API version 1
 */
CursorDevice.prototype.selectParent = function() {};

/**
 * Moves this cursor to the given device.
 *
 * @param device
          the device that this cursor should point to
 * @since API version 1
 */
CursorDevice.prototype.selectDevice = function(device) {};

/**
 * Selects the first device in the given channel.
 *
 * @param channel
          the channel in which the device should be selected
 * @since API version 1
 */
CursorDevice.prototype.selectFirstInChannel = function(channel) {};

/**
 * Selects the last device in the given channel.
 *
 * @param channel
          the channel in which the device should be selected
 * @since API version 1
 */
CursorDevice.prototype.selectLastInChannel = function(channel) {};

/**
 * Selects the first device in the nested FX slot with the given name.
 *
 * @param chain
          the name of the FX slot in which the device should be selected
 * @since API version 1
 */
CursorDevice.prototype.selectFirstInSlot = function(chain) {};

/**
 * Selects the last device in the nested FX slot with the given name.
 *
 * @param chain
          the name of the FX slot in which the device should be selected
 * @since API version 1
 */
CursorDevice.prototype.selectLastInSlot = function(chain) {};

/**
 * Selects the first device in the drum pad associated with the given key.
 *
 * @param key
          the key associated with the drum pad in which the device should be selected
 * @since API version 1
 */
CursorDevice.prototype.selectFirstInKeyPad = function(key) {};

/**
 * Selects the last device in the drum pad associated with the given key.
 *
 * @param key
          the key associated with the drum pad in which the device should be selected
 * @since API version 1
 */
CursorDevice.prototype.selectLastInKeyPad = function(key) {};

/**
 * Selects the first device in the nested layer with the given index.
 *
 * @param index
          the index of the nested layer in which the device should be selected
 * @since API version 1
 */
CursorDevice.prototype.selectFirstInLayer = function(index) {};

/**
 * Selects the last device in the nested layer with the given index.
 *
 * @param index
          the index of the nested layer in which the device should be selected
 * @since API version 1
 */
CursorDevice.prototype.selectLastInLayer = function(index) {};

/**
 * Selects the first device in the nested layer with the given name.
 *
 * @param name
          the name of the nested layer in which the device should be selected
 * @since API version 1
 */
CursorDevice.prototype.selectFirstInLayer = function(name) {};

/**
 * Selects the last device in the nested layer with the given name.
 *
 * @param name
          the name of the nested layer in which the device should be selected
 * @since API version 1
 */
CursorDevice.prototype.selectLastInLayer = function(name) {};
