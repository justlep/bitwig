/* API Version - 2.3.1 */

function IndexedColorValueChangedCallback() {}

IndexedColorValueChangedCallback.prototype = new IndexedValueChangedCallback();
IndexedColorValueChangedCallback.prototype.constructor = IndexedColorValueChangedCallback;

/**
 * Registers an observer that reports the names of the scenes and slots. The slot names reflect the names
 * of containing clips.
 *
 * @param {int} index
 * @param {float} red
 * @param {float} green
 * @param {float} blue
 * @since API version 1
 */
IndexedColorValueChangedCallback.prototype.valueChanged = function(index, red, green, blue) {};
