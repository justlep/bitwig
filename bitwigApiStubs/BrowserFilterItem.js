/* API Version - 2.3.1 */

/**
 * Instances of this interface represent entries in a browser filter column.
 *
 * @since API version 1
 */
function BrowserFilterItem() {}

BrowserFilterItem.prototype = new BrowserItem();
BrowserFilterItem.prototype.constructor = BrowserFilterItem;

/**
 * Value that reports the hit count of the filter item.
 *
 * @return {IntegerValue}
 * @since API version 2
 */
BrowserFilterItem.prototype.hitCount = function() {};
