/* API Version - 2.1.3 */

/**
 * This interface defines access to the common attributes and operations of channels, such as tracks or nested
 * device channels.
 *
 * @since API version 1
 */
function Channel() {}

Channel.prototype = new DeviceChain();
Channel.prototype.constructor = Channel;

/**
 * Returns an object that represents the activated state of the channel.
 *
 * @return {SettableBooleanValue} an object that provides access to the channels activated state.
 * @since API version 1
 */
Channel.prototype.isActivated = function() {};

/**
 * Gets a representation of the channels volume control.
 *
 * @return {Parameter} an object that provides access to the channels volume control.
 * @since API version 1
 */
Channel.prototype.getVolume = function() {};

/**
 * Gets a representation of the channels pan control.
 *
 * @return {Parameter} an object that provides access to the channels pan control.
 * @since API version 1
 */
Channel.prototype.getPan = function() {};

/**
 * Gets a representation of the channels mute control.
 *
 * @return {SettableBooleanValue} an object that provides access to the channels mute control.
 * @since API version 1
 */
Channel.prototype.getMute = function() {};

/**
 * Gets a representation of the channels solo control.
 *
 * @return {SoloValue} an object that provides access to the channels solo control.
 * @since API version 1
 */
Channel.prototype.getSolo = function() {};

/**
 * Registers an observer for the VU-meter of this track.
 *
 * @param range
          the number of steps to which the reported values should be scaled. For example a range of 128
          would cause the callback to be called with values between 0 and 127.
 * @param channel
          0 for left channel, 1 for right channel, -1 for the sum of both
 * @param peak
          when `true` the peak value is reported, otherwise the RMS value
 * @param callback
          a callback function that takes a single numeric argument. The value is in the range
          [0..range-1].
 * @since API version 1
 */
Channel.prototype.addVuMeterObserver = function(range, channel, peak, callback) {};

/**
 * Returns an array of the playing notes.
 *
 * @return {PlayingNoteArrayValue}
 * @since API version 2
 */
Channel.prototype.playingNotes = function() {};

/**
 * Get the color of the channel.
 *
 * @return {SettableColorValue}
 * @since API version 2
 */
Channel.prototype.color = function() {};

/**
 * Gets a {@link SendBank} that can be used to navigate the sends of this channel.
 *
 * @return {SendBank}
 * @since API version 2
 */
Channel.prototype.sendBank = function() {};

/**
 * Duplicates the track.
 *
 * @since API version 1
 */
Channel.prototype.duplicate = function() {};

/**
 * Selects the device chain in the Bitwig Studio mixer, in case it is a selectable object.
 *
 * @since API version 1
 */
Channel.prototype.selectInMixer = function() {};

/**
 * Registers an observer that reports if the device chain is selected in Bitwig Studio mixer.
 *
 * @param callback
          a callback function that takes a single boolean parameter.
 * @since API version 1
 */
Channel.prototype.addIsSelectedInMixerObserver = function(callback) {};

/**
 * Tries to scroll the contents of the arrangement editor so that the channel becomes visible.
 *
 * @since API version 1
 */
Channel.prototype.makeVisibleInArranger = function() {};

/**
 * Tries to scroll the contents of the mixer panel so that the channel becomes visible.
 *
 * @since API version 1
 */
Channel.prototype.makeVisibleInMixer = function() {};
