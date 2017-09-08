/* API Version - 2.1.3 */

function IndexedBooleanValueChangedCallback() {}

IndexedBooleanValueChangedCallback.prototype = new IndexedValueChangedCallback();
IndexedBooleanValueChangedCallback.prototype.constructor = IndexedBooleanValueChangedCallback;

/**
 * Registers an observer that reports the names of the scenes and slots. The slot names reflect the names
 * of containing clips.
 *
 * @param {int} index
 * @param {boolean} newValue
 * @since API version 1
 */
IndexedBooleanValueChangedCallback.prototype.valueChanged = function(index, newValue) {};
