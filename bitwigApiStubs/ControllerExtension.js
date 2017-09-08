/* API Version - 2.1.3 */

/**
 * Defines an extension that enabled a controller to work with Bitwig Studio.
 */
function ControllerExtension() {}

/**
 * @param {int} index
 * @return {MidiIn}
 */
ControllerExtension.prototype.getMidiInPort = function(index) {};

/**
 * @param {int} index
 * @return {MidiOut}
 */
ControllerExtension.prototype.getMidiOutPort = function(index) {};

/**
 * Initializes this controller extension. This will be called once when the extension is started. During initialization the
 * extension should call the various create methods available via the {@link ControllerHost} interface in order to
 * create objects used to communicate with various parts of the Bitwig Studio application (e.g
 * {@link ControllerHost#createCursorTrack(int, int)}.
 */
ControllerExtension.prototype.init = function() {};

/**
 * Called once when this controller extension is stopped.
 */
ControllerExtension.prototype.exit = function() {};

/**
 * Called when this controller extension should flush any pending updates to the controller.
 */
ControllerExtension.prototype.flush = function() {};
