/* API Version - 2.1.3 */

/**
 * An abstract interface that represents the clip launcher scenes or slots of a single track.
 *
 * @since API version 1
 */
function ClipLauncherSlotOrSceneBank() {}

ClipLauncherSlotOrSceneBank.prototype = new Bank();
ClipLauncherSlotOrSceneBank.prototype.constructor = ClipLauncherSlotOrSceneBank;

/**
 * Launches the scene/slot with the given index.
 *
 * @param slot
          the index of the slot that should be launched
 * @since API version 1
 */
ClipLauncherSlotOrSceneBank.prototype.launch = function(slot) {};

/**
 * Stops clip launcher playback for the associated track.
 *
 * @since API version 1
 */
ClipLauncherSlotOrSceneBank.prototype.stop = function() {};

/**
 * Performs a return-to-arrangement operation on the related track, which caused playback to be taken over
 * by the arrangement sequencer.
 *
 * @since API version 1
 */
ClipLauncherSlotOrSceneBank.prototype.returnToArrangement = function() {};

/**
 * Registers an observer that reports the names of the scenes and slots. The slot names reflect the names
 * of containing clips.
 *
 * @param callback
          a callback function receiving two parameters: 1. the slot index (integer) within the
          configured window, and 2. the name of the scene/slot (string)
 * @since API version 1
 */
ClipLauncherSlotOrSceneBank.prototype.addNameObserver = function(callback) {};
