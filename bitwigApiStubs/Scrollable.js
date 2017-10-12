/* API Version - 2.2 */

/**
 * Interface for something that can be scrolled.
 *
 * @since API version 2
 */
function Scrollable() {}

/**
 * Value that reports the current scene scroll position.
 *
 * @return {SettableIntegerValue}
 * @since API version 2
 */
Scrollable.prototype.scrollPosition = function() {};

/**
 * Scrolls by a number of steps.
 *
 * @param amount
          The number of steps to scroll by (positive is forwards and negative is backwards).
 */
Scrollable.prototype.scrollBy = function(amount) {};

/**
 * Scrolls forwards by one step. This is the same as calling {@link #scrollBy(int)} with 1
 *
 * @since API version 2
 */
Scrollable.prototype.scrollForwards = function() {};

/**
 * Scrolls forwards by one step. This is the same as calling {@link #scrollBy(int)} with -1
 *
 * @since API version 2
 */
Scrollable.prototype.scrollBackwards = function() {};

/**
 * Scrolls by a number of pages.
 *
 * @param amount
          The number of pages to scroll by (positive is forwards and negative is backwards).
 */
Scrollable.prototype.scrollByPages = function(pages) {};

/**
 * Scrolls forwards by one page.
 *
 * @since API version 2
 */
Scrollable.prototype.scrollPageForwards = function() {};

/**
 * Scrolls backwards by one page.
 *
 * @since API version 2
 */
Scrollable.prototype.scrollPageBackwards = function() {};

/**
 * Value that reports if it is possible to scroll the bank backwards or not.
 *
 * @return {BooleanValue}
 * @since API version 2
 */
Scrollable.prototype.canScrollBackwards = function() {};

/**
 * Value that reports if it is possible to scroll the bank forwards or not.
 *
 * @return {BooleanValue}
 * @since API version 2
 */
Scrollable.prototype.canScrollForwards = function() {};
