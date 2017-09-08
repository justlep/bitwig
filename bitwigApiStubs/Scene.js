/* API Version - 2.1.3 */

/**
 * Instances of this interface represent scenes in Bitwig Studio.
 *
 * @since API version 1
 */
function Scene() {}

Scene.prototype = new ClipLauncherSlotOrScene();
Scene.prototype.constructor = Scene;

/**
 * Returns an object that provides access to the name of the scene.
 *
 * @return {SettableStringValue} a string value object that represents the scene name.
 * @since API version 2
 */
Scene.prototype.name = function() {};

/**
 * Value that reports the number of clips in the scene.
 *
 * @return {IntegerValue}
 * @since API version 2
 */
Scene.prototype.clipCount = function() {};

/**
 * Registers an observer that reports if the scene is selected in Bitwig Studio.
 *
 * @param callback
          a callback function that takes a single boolean parameter.
 * @since API version 1
 */
Scene.prototype.addIsSelectedInEditorObserver = function(callback) {};

/**
 * Selects the scene in Bitwig Studio.
 *
 * @since API version 1
 */
Scene.prototype.selectInEditor = function() {};

/**
 * Makes the scene visible in the Bitwig Studio user interface.
 *
 * @since API version 1
 */
Scene.prototype.showInEditor = function() {};
