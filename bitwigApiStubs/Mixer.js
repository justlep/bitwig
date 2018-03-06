/* API Version - 2.3.1 */

/**
 * An interface used to access various commands that can be performed on the Bitwig Studio mixer panel.<br/>
 * 
 * To get an instance of the mixer interface call {@link ControllerHost#createMixer}.
 *
 * @since API version 1
 */
function Mixer() {}

/**
 * Gets an object that allows to show/hide the meter section of the mixer panel. Observers can be
 * registered on the returned object for receiving notifications when the meter section switches between
 * shown and hidden state.
 *
 * @return {SettableBooleanValue} a boolean value object that represents the meter section visibility
 * @since API version 1
 */
Mixer.prototype.isMeterSectionVisible = function() {};

/**
 * Gets an object that allows to show/hide the io section of the mixer panel. Observers can be registered
 * on the returned object for receiving notifications when the io section switches between shown and hidden
 * state.
 *
 * @return {SettableBooleanValue} a boolean value object that represents the io section visibility
 * @since API version 1
 */
Mixer.prototype.isIoSectionVisible = function() {};

/**
 * Gets an object that allows to show/hide the sends section of the mixer panel. Observers can be
 * registered on the returned object for receiving notifications when the sends section switches between
 * shown and hidden state.
 *
 * @return {SettableBooleanValue} a boolean value object that represents the sends section visibility
 * @since API version 1
 */
Mixer.prototype.isSendSectionVisible = function() {};

/**
 * Gets an object that allows to show/hide the clip launcher section of the mixer panel. Observers can be
 * registered on the returned object for receiving notifications when the clip launcher section switches
 * between shown and hidden state.
 *
 * @return {SettableBooleanValue} a boolean value object that represents the clip launcher section visibility
 * @since API version 1
 */
Mixer.prototype.isClipLauncherSectionVisible = function() {};

/**
 * Gets an object that allows to show/hide the devices section of the mixer panel. Observers can be
 * registered on the returned object for receiving notifications when the devices section switches between
 * shown and hidden state.
 *
 * @return {SettableBooleanValue} a boolean value object that represents the devices section visibility
 * @since API version 1
 */
Mixer.prototype.isDeviceSectionVisible = function() {};

/**
 * Gets an object that allows to show/hide the cross-fade section of the mixer panel. Observers can be
 * registered on the returned object for receiving notifications when the cross-fade section switches
 * between shown and hidden state.
 *
 * @return {SettableBooleanValue} a boolean value object that represents the cross-fade section visibility
 * @since API version 1
 */
Mixer.prototype.isCrossFadeSectionVisible = function() {};
