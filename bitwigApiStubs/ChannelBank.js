/* API Version - 2.1.3 */

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
 * Returns the channel for the given index.
 *
 * @param indexInBank
          the channel index within this bank, not the index within the list of all Bitwig Studio
          channels. Must be in the range [0..sizeOfBank-1].
 * @return {Channel} the channel object
 * @since API version 1
 */
ChannelBank.prototype.getChannel = function(indexInBank) {};

/**
 * Sets the step size used for scrolling the channel bank.
 *
 * @param stepSize
          the step size used for scrolling. Default is `1`.
 * @since API version 1
 */
ChannelBank.prototype.setChannelScrollStepSize = function(stepSize) {};

/**
 * Scrolls the channels one page up. For example if the channel bank is configured with a window size of 8
 * channels and is currently showing channel [1..8], calling this method would scroll the channel bank to
 * show channel [9..16].
 *
 * @since API version 1
 */
ChannelBank.prototype.scrollChannelsPageUp = function() {};

/**
 * Scrolls the channels one page up. For example if the channel bank is configured with a window size of 8
 * channels and is currently showing channel [9..16], calling this method would scroll the channel bank to
 * show channel [1..8].
 *
 * @since API version 1
 */
ChannelBank.prototype.scrollChannelsPageDown = function() {};

/**
 * Scrolls the channel window up by the amount specified via {@link #setChannelScrollStepSize(int)} (by
 * default one channel).
 *
 * @since API version 1
 */
ChannelBank.prototype.scrollChannelsUp = function() {};

/**
 * Scrolls the channel window down by the amount specified via {@link #setChannelScrollStepSize(int)} (by
 * default one channel).
 *
 * @since API version 1
 */
ChannelBank.prototype.scrollChannelsDown = function() {};

/**
 * Scrolls the channel bank window so that the channel at the given position becomes visible.
 *
 * @param position
          the index of the channel within the underlying full list of channels (not the index within the
          bank). The position is typically directly related to the layout of the channel list in Bitwig
          Studio, starting with zero in case of the first channel.
 * @since API version 1
 */
ChannelBank.prototype.scrollToChannel = function(position) {};

/**
 * Value that reports the current scroll position, more specifically the position of the
 * first channel within the underlying list of channels, that is shown as channel zero within the bank.
 *
 * @return {IntegerValue}
 * @since API version 2
 */
ChannelBank.prototype.channelScrollPosition = function() {};

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
