/* API Version - 2.3.1 */

/**
 * Instances of this interface represent entries in a browser filter column.
 *
 * @since API version 1
 */
function CursorBrowserItem() {}

CursorBrowserItem.prototype = new BrowserItem();
CursorBrowserItem.prototype.constructor = CursorBrowserItem;

/**
 * Returns a bank object that provides access to the siblings of the cursor item. The bank will
 * automatically scroll so that the cursor item is always visible.
 *
 * @param numSiblings
          the number of simultaneously accessible siblings
 * @return {BrowserItemBank} the requested item bank object
 */
CursorBrowserItem.prototype.createSiblingsBank = function(numSiblings) {};
