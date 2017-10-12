/* API Version - 2.2 */

function ClipLauncherSlotBankPlaybackStateChangedCallback() {}

ClipLauncherSlotBankPlaybackStateChangedCallback.prototype = new Callback();
ClipLauncherSlotBankPlaybackStateChangedCallback.prototype.constructor = ClipLauncherSlotBankPlaybackStateChangedCallback;

/**
 * Registers an observer that reports the playback state of clips / slots. The reported states include
 * `stopped`, `playing`, `recording`, but also `queued for stop`, `queued for playback`, `queued for
 * recording`.
 *
 * @param {int} slotIndex
 * @param {int} playbackState
 * @param {boolean} isQueued
 * @since API version 1
 */
ClipLauncherSlotBankPlaybackStateChangedCallback.prototype.playbackStateChanged = function(slotIndex, playbackState, isQueued) {};
