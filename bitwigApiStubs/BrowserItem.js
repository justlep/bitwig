/* API Version - 2.1.3 */

/**
 * Instances of this interface represent entries in a browser filter column.
 *
 * @since API version 1
 */
function BrowserItem() {}

BrowserItem.prototype = new ObjectProxy();
BrowserItem.prototype.constructor = BrowserItem;

/**
 * Value that reports the name of the browser item.
 *
 * @return {StringValue}
 * @since API version 2
 */
BrowserItem.prototype.name = function() {};

/**
 * Returns an object that provides access to the selected state of the browser item.
 *
 * @return {SettableBooleanValue} an boolean value object
 * @since API version 1
 */
BrowserItem.prototype.isSelected = function() {};
