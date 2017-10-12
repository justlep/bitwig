/* API Version - 2.2 */

/**
 * Instances of this interface are used to navigate the filter columns of a Bitwig Studio browsing session.
 *
 * @since API version 1
 */
function CursorBrowserFilterColumn() {}

CursorBrowserFilterColumn.prototype = new BrowserFilterColumn();
CursorBrowserFilterColumn.prototype.constructor = CursorBrowserFilterColumn;
