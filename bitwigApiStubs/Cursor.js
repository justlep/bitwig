/* API Version - 2.3.1 */

/**
 * A generic interface that provides the foundation for working with selections.
 * 
 * Implementations of this interface can either represent custom selection cursors that are created by
 * controller scripts, or represent the cursor of user selections as shown in Bitwig Studio editors, such as
 * the Arranger track selection cursor, the note editor event selection cursor and so on.
 *
 * @since API version 1
 */
function Cursor() {}

/**
 * Select the previous item.
 *
 * @since API version 1
 */
Cursor.prototype.selectPrevious = function() {};

/**
 * Select the next item.
 *
 * @since API version 1
 */
Cursor.prototype.selectNext = function() {};

/**
 * Select the first item.
 *
 * @since API version 1
 */
Cursor.prototype.selectFirst = function() {};

/**
 * Select the last item.
 *
 * @since API version 1
 */
Cursor.prototype.selectLast = function() {};

/**
 * Boolean value that reports whether there is an item after the current cursor position.
 *
 * @return {BooleanValue}
 * @since API version 2
 */
Cursor.prototype.hasNext = function() {};

/**
 * Boolean value that reports whether there is an item before the current cursor position.
 *
 * @return {BooleanValue}
 * @since API version 2
 */
Cursor.prototype.hasPrevious = function() {};
