/* API Version - 2.2 */

function ClipLauncherSlotOrScene() {}

ClipLauncherSlotOrScene.prototype = new ObjectProxy();
ClipLauncherSlotOrScene.prototype.constructor = ClipLauncherSlotOrScene;

/**
 * Returns an object that provides access to the name of the scene.
 *
 * @return {StringValue} a string value object that represents the scene name.
 * @since API version 2
 */
ClipLauncherSlotOrScene.prototype.name = function() {};

/**
 * Launches the scene.
 *
 * @since API version 1
 */
ClipLauncherSlotOrScene.prototype.launch = function() {};

/**
 * Value that reports the position of the scene within the list of Bitwig Studio scenes.
 *
 * @return {IntegerValue}
 * @since API version 2
 */
ClipLauncherSlotOrScene.prototype.sceneIndex = function() {};

/**
 * Copies the current slot or scene into the dest slot or scene.
 *
 * @param {ClipLauncherSlotOrScene} source
 * @since API version 4
 */
ClipLauncherSlotOrScene.prototype.copyFrom = function(source) {};

/**
 * Moves the current slot or scene into the destination slot or scene.
 *
 * @param {ClipLauncherSlotOrScene} dest
 * @since API version 4
 */
ClipLauncherSlotOrScene.prototype.moveTo = function(dest) {};
