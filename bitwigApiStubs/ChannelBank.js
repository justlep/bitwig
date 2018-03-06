/* API Version - 2.3.1 */

/**
 * A channel bank provides access to a range of channels in Bitwig Studio, such as tracks or device layers.
 * Instances of channel bank are typically configured with support for a fixed number of channels and
 * represent an excerpt of a larger list of channels. Various methods are provided for scrolling to different
 * sections of the channel list. It basically acts like a window moving over the list of channels.
 *
 * @since API version 1
 */
function ChannelBank() {}

ChannelBank.prototype = new ObjectProxy();
ChannelBank.prototype.constructor = ChannelBank;

/**
 * Sets the step size used for scrolling the channel bank.
 *
 * @param stepSize
          the step size used for scrolling. Default is `1`.
 * @since API version 1
 */
ChannelBank.prototype.setChannelScrollStepSize = function(stepSize) {};

/**
 * Value that reports if the channel bank can be scrolled further down.
 *
 * @return {BooleanValue}
 * @since API version 2
 */
ChannelBank.prototype.canScrollChannelsUp = function() {};

/**
 * Value that reports if the channel bank can be scrolled further down.
 *
 * @return {BooleanValue}
 * @since API version 2
 */
ChannelBank.prototype.canScrollChannelsDown = function() {};

/**
 * Value that reports the underlying total channel count (not the number of channels available in the bank
 * window).
 *
 * @return {IntegerValue}
 * @since API version 2
 */
ChannelBank.prototype.channelCount = function() {};
