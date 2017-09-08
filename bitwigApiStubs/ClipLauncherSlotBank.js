/* API Version - 2.1.3 */

/**
 * Instances of this interface represent a scrollable fixed-size window that is connected to a section of the
 * clip launcher slots for a specific track.
 *
 * @since API version 1
 */
function ClipLauncherSlotBank() {}

ClipLauncherSlotBank.prototype = new ClipLauncherSlotOrSceneBank();
ClipLauncherSlotBank.prototype.constructor = ClipLauncherSlotBank;

/**
 * Selects the slot with the given index.
 *
 * @param slot
          the index of the slot within the slot window.
 * @since API version 1
 */
ClipLauncherSlotBank.prototype.select = function(slot) {};

/**
 * Starts recording into the slot with the given index.
 *
 * @param slot
          the index of the slot within the slot window.
 * @since API version 1
 */
ClipLauncherSlotBank.prototype.record = function(slot) {};

/**
 * Makes the clip content of the slot with the given index visible in the note or audio editor.
 *
 * @param slot
          the index of the slot within the slot window.
 * @since API version 1
 */
ClipLauncherSlotBank.prototype.showInEditor = function(slot) {};

/**
 * Creates an new clip in the slot with the given index.
 *
 * @param {int} slot
 * @param {int} lengthInBeats
 * @since API version 1
 */
ClipLauncherSlotBank.prototype.createEmptyClip = function(slot, lengthInBeats) {};

/**
 * Deletes the clip in the slot with the given index.
 *
 * @param slot
          the index of the slot within the slot window.
 * @since API version 1
 */
ClipLauncherSlotBank.prototype.deleteClip = function(slot) {};

/**
 * Duplicates the clip in the slot with the given index.
 *
 * @param slot
          the index of the slot within the slot window.
 * @since API version 1
 */
ClipLauncherSlotBank.prototype.duplicateClip = function(slot) {};

/**
 * Registers an observer that reports selection changes for the slots inside the window.
 *
 * @param callback
          a callback function that receives two parameters: 1. the slot index (integer), and 2. a
          boolean parameter indicating if the slot at that index is selected (`true`) or not (`false`)
 * @since API version 1
 */
ClipLauncherSlotBank.prototype.addIsSelectedObserver = function(callback) {};

/**
 * Registers an observer that reports which slots contain clips.
 *
 * @param callback
          a callback function that receives two parameters: 1. the slot index (integer), and 2. a
          boolean parameter indicating if the slot at that index contains a clip (`true`) or not
          (`false`)
 * @since API version 1
 */
ClipLauncherSlotBank.prototype.addHasContentObserver = function(callback) {};

/**
 * Registers an observer that reports the playback state of clips / slots. The reported states include
 * `stopped`, `playing`, `recording`, but also `queued for stop`, `queued for playback`, `queued for
 * recording`.
 *
 * @param callback
          a callback function that receives three parameters: 1. the slot index (integer), 2. the queued
          or playback state: `0` when stopped, `1` when playing, or `2` when recording, and 3. a boolean
          parameter indicating if the second argument is referring to the queued state (`true`) or the
          actual playback state (`false`)
 * @since API version 1
 */
ClipLauncherSlotBank.prototype.addPlaybackStateObserver = function(callback) {};

/**
 * Registers an observer that reports which slots have clips that are currently playing.
 *
 * @param callback
          a callback function that receives two parameters: 1. the slot index (integer), and 2. a
          boolean parameter indicating if the slot at that index has a clip that is currently playing
          (`true`) or not (`false`)
 * @since API version 1
 */
ClipLauncherSlotBank.prototype.addIsPlayingObserver = function(callback) {};

/**
 * Registers an observer that reports which slots have clips that are currently recording.
 *
 * @param callback
          a callback function that receives two parameters: 1. the slot index (integer), and 2. a
          boolean parameter indicating if the slot at that index has a clip that is currently recording
          (`true`) or not (`false`)
 * @since API version 1
 */
ClipLauncherSlotBank.prototype.addIsRecordingObserver = function(callback) {};

/**
 * Add an observer if clip playback is queued on the slot.
 *
 * @param callback
          a callback function that receives two parameters: 1. the slot index (integer), and 2. a
          boolean parameter indicating if the slot at that index has a clip that is currently queued for
          playback (`true`) or not (`false`)
 * @since API version 1
 */
ClipLauncherSlotBank.prototype.addIsPlaybackQueuedObserver = function(callback) {};

/**
 * Add an observer if clip recording is queued on the slot.
 *
 * @param callback
          a callback function that receives two parameters: 1. the slot index (integer), and 2. a
          boolean parameter indicating if the slot at that index has a clip that is currently queued for
          recording (`true`) or not (`false`)
 * @since API version 1
 */
ClipLauncherSlotBank.prototype.addIsRecordingQueuedObserver = function(callback) {};

/**
 * Add an observer if clip playback is queued to stop on the slot.
 *
 * @param callback
          a callback function that receives two parameters: 1. the slot index (integer), and 2. a
          boolean parameter indicating if the slot at that index has a clip that is currently queued for
          stop (`true`) or not (`false`)
 * @since API version 1
 */
ClipLauncherSlotBank.prototype.addIsStopQueuedObserver = function(callback) {};

/**
 * Registers an observer that reports the colors of clip in the current slot window.
 *
 * @param callback
          a callback function that receives four parameters: 1. the slot index (integer), 2. the red
          coordinate of the RBG color value, 3. the green coordinate of the RBG color value, and 4. the
          blue coordinate of the RBG color value
 * @since API version 1
 */
ClipLauncherSlotBank.prototype.addColorObserver = function(callback) {};

/**
 * Specifies if the Bitwig Studio clip launcher should indicate which slots are part of the window. By
 * default indications are disabled.
 *
 * @param shouldIndicate
          `true` if visual indications should be enabled, `false` otherwise
 * @since API version 1
 */
ClipLauncherSlotBank.prototype.setIndication = function(shouldIndicate) {};

/**
 * Returns an object that can be used to observe and toggle if the slots on a connected track group show
 * either scenes launch buttons (for launching the content of the track group) or the clips of the group
 * master track.
 *
 * @return {SettableBooleanValue} a boolean value object.
 */
ClipLauncherSlotBank.prototype.isMasterTrackContentShownOnTrackGroups = function() {};
