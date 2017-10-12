/* API Version - 2.2 */

/**
 * A scene bank provides access to a range of scenes in Bitwig Studio. Instances of scene bank are configured
 * with a fixed number of scenes and represent an excerpt of a larger list of scenes. Various methods are
 * provided for scrolling to different sections of the scene list. It basically acts like a window moving over
 * the list of underlying scenes.
 * 
 * To receive an instance of scene bank call
 * {@link ControllerHost#createSceneBank}.
 *
 * @see {@link ControllerHost#createSceneBank}
 * @since API version 1
 */
function SceneBank() {}

SceneBank.prototype = new ClipLauncherSlotOrSceneBank();
SceneBank.prototype.constructor = SceneBank;

/**
 * Returns the scene at the given index within the bank.
 *
 * @param indexInBank
          the scene index within this bank, not the index within the list of all Bitwig Studio scenes.
          Must be in the range [0..sizeOfBank-1].
 * @return {Scene} the requested scene object
 * @since API version 1
 */
SceneBank.prototype.getScene = function(indexInBank) {};

/**
 * Launches the scene with the given bank index.
 *
 * @param indexInWindow
          the scene index within the bank, not the position of the scene withing the underlying full
          list of scenes.
 * @since API version 1
 */
SceneBank.prototype.launchScene = function(indexInWindow) {};
