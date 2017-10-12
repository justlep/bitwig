/* API Version - 2.2 */

/**
 * A generic interface used to implement actions or events that are not associated with a value.
 *
 * @since API version 1
 */
function Signal() {}

/**
 * Registers an observer that gets notified when the signal gets fired.
 *
 * @param callback
          a callback function that does not receive any argument.
 * @since API version 1
 */
Signal.prototype.addSignalObserver = function(callback) {};

/**
 * Fires the action or event represented by the signal object.
 *
 * @since API version 1
 */
Signal.prototype.fire = function() {};
