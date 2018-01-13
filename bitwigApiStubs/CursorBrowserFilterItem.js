/* API Version - 2.2.3 */

/**
 * Instances of this interface represent entries in a browser filter column.
 *
 * @since API version 1
 */
function CursorBrowserFilterItem() {}

CursorBrowserFilterItem.prototype = new BrowserFilterItem();
CursorBrowserFilterItem.prototype.constructor = CursorBrowserFilterItem;

/**
 * Select the parent item.
 *
 * @since API version 1
 */
CursorBrowserFilterItem.prototype.selectParent = function() {};

/**
 * Select the first child item.
 *
 * @since API version 1
 */
CursorBrowserFilterItem.prototype.selectFirstChild = function() {};

/**
 * Select the last child item.
 *
 * @since API version 1
 */
CursorBrowserFilterItem.prototype.selectLastChild = function() {};

/**
 * Select the previous item.
 *
 * @since API version 1
 */
CursorBrowserFilterItem.prototype.moveToPrevious = function() {};

/**
 * Select the next item.
 *
 * @since API version 1
 */
CursorBrowserFilterItem.prototype.moveToNext = function() {};

/**
 * Select the first item.
 *
 * @since API version 1
 */
CursorBrowserFilterItem.prototype.moveToFirst = function() {};

/**
 * Select the last item.
 *
 * @since API version 1
 */
CursorBrowserFilterItem.prototype.moveToLast = function() {};

/**
 * Select the parent item.
 *
 * @since API version 1
 */
CursorBrowserFilterItem.prototype.moveToParent = function() {};

/**
 * Move the cursor to the first child item.
 *
 * @since API version 1
 */
CursorBrowserFilterItem.prototype.moveToFirstChild = function() {};

/**
 * Move the cursor to the last child item.
 *
 * @since API version 1
 */
CursorBrowserFilterItem.prototype.moveToLastChild = function() {};
