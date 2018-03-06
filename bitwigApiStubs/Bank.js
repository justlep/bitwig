/* API Version - 2.3.1 */

/**
 * A bank provides access to a range of items in Bitwig Studio. Instances of a bank are configured with a
 * fixed number of items and represent an excerpt of a larger list of items. Various methods are provided for
 * scrolling to different sections of the item list. It basically acts like a window moving over the list of
 * underlying items.
 *
 * @since API version 2
 */
function Bank() {}

Bank.prototype = new ObjectProxy();
Bank.prototype.constructor = Bank;

/**
 * The fixed size of this bank.
 *
 * @return {int}
 * @since API version 2
 */
Bank.prototype.getSizeOfBank = function() {};

Bank.prototype.scrollPageForwards = function() {};

Bank.prototype.scrollPageBackwards = function() {};

/**
 * Gets the item in the bank at the supplied index. The index must be >= 0 and < {@link #getSizeOfBank()}.
 *
 * @param {int} index
 * @return {ItemType}
 * @since API version 2
 */
Bank.prototype.getItemAt = function(index) {};

/**
 * Value that reports the underlying total item count (not the number of items available in the bank
 * window).
 *
 * @return {IntegerValue}
 * @since API version 2
 */
Bank.prototype.itemCount = function() {};

/**
 * An integer value that defines the location of the cursor that this bank is following. If there is no
 * cursor or the cursor is not within the bank then the value is -1.
 *
 * @return {SettableIntegerValue}
 * @since API version 2
 */
Bank.prototype.cursorIndex = function() {};
