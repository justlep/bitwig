/* API Version - 2.2 */

/**
 * Instances of this interface are used to navigate a results column in the Bitwig Studio browser.
 *
 * @since API version 1
 */
function BrowserResultsColumn() {}

BrowserResultsColumn.prototype = new BrowserColumn();
BrowserResultsColumn.prototype.constructor = BrowserResultsColumn;

/**
 * Returns the cursor result item, which can be used to navigate over the list of entries.
 *
 * @return {BrowserResultsItem} the requested filter item object
 * @since API version 1
 */
BrowserResultsColumn.prototype.createCursorItem = function() {};

/**
 * Returns an object that provides access to a bank of successive entries using a window configured with
 * the given size, that can be scrolled over the list of entries.
 *
 * @param size
          the number of simultaneously accessible items
 * @return {BrowserResultsItemBank} the requested item bank object
 */
BrowserResultsColumn.prototype.createItemBank = function(size) {};
