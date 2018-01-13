/* API Version - 2.2.3 */

function ClipLauncherSlot() {}

ClipLauncherSlot.prototype = new ClipLauncherSlotOrScene();
ClipLauncherSlot.prototype.constructor = ClipLauncherSlot;

/**
 * Value that reports whether this slot is selected or not.
 *
 * @return {BooleanValue}
 * @since API version 2
 */
ClipLauncherSlot.prototype.isSelected = function() {};

/**
 * Value that reports whether this slot has content or not.
 *
 * @return {BooleanValue}
 * @since API version 2
 */
ClipLauncherSlot.prototype.hasContent = function() {};

/**
 * Value that reports whether this slot is playing or not.
 *
 * @return {BooleanValue}
 * @since API version 2
 */
ClipLauncherSlot.prototype.isPlaying = function() {};

/**
 * Value that reports whether this slot is queued for playback or not.
 *
 * @return {BooleanValue}
 * @since API version 2
 */
ClipLauncherSlot.prototype.isPlaybackQueued = function() {};

/**
 * Value that reports whether this slot is recording or not.
 *
 * @return {BooleanValue}
 * @since API version 2
 */
ClipLauncherSlot.prototype.isRecording = function() {};

/**
 * Value that reports whether this slot is queued for recording or not.
 *
 * @return {BooleanValue}
 * @since API version 2
 */
ClipLauncherSlot.prototype.isRecordingQueued = function() {};

/**
 * Value that reports whether this slot is queued for recording or not.
 *
 * @return {BooleanValue}
 * @since API version 2
 */
ClipLauncherSlot.prototype.isStopQueued = function() {};

/**
 * Value that reports the color of this slot.
 *
 * @return {ColorValue}
 * @since API version 2
 */
ClipLauncherSlot.prototype.color = function() {};

/**
 * Starts browsing for content that can be inserted in this slot in Bitwig Studio's popup browser.
 *
 * @since API version 2
 */
ClipLauncherSlot.prototype.browseToInsertClip = function() {};
