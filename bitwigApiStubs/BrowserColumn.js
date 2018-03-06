/* API Version - 2.3.1 */

/**
 * Instances of this interface are used to navigate a column in the Bitwig Studio browser.
 *
 * @since API version 1
 */
function BrowserColumn() {}

BrowserColumn.prototype = new ObjectProxy();
BrowserColumn.prototype.constructor = BrowserColumn;

/**
 * Value that reports the underlying total count of column entries (not the size of the column window).
 *
 * @return {IntegerValue}
 * @since API version 2
 */
BrowserColumn.prototype.entryCount = function() {};

/**
 * Returns the cursor item, which can be used to navigate over the list of entries.
 *
 * @return {BrowserItem} the requested filter item object
 * @since API version 1
 */
BrowserColumn.prototype.createCursorItem = function() {};

/**
 * Returns an object that provides access to a bank of successive entries using a window configured with
 * the given size, that can be scrolled over the list of entries.
 *
 * @param size
          the number of simultaneously accessible items
 * @return {BrowserItemBank} the requested item bank object
 */
BrowserColumn.prototype.createItemBank = function(size) {};
