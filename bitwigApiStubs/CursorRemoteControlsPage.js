/* API Version - 2.3.1 */

/**
 * Represents a cursor that looks at a {@link RemoteControlsPage}.
 *
 * @since API version 2
 */
function CursorRemoteControlsPage() {}

CursorRemoteControlsPage.prototype = new Cursor();
CursorRemoteControlsPage.prototype.constructor = CursorRemoteControlsPage;

/**
 * Value that reports the names of the devices parameter pages.
 *
 * @return {StringArrayValue}
 */
CursorRemoteControlsPage.prototype.pageNames = function() {};

/**
 * Selects the next page.
 *
 * @param shouldCycle
          If true then when the end is reached and there is no next page it selects the first page
 * @since API version 2
 */
CursorRemoteControlsPage.prototype.selectNextPage = function(shouldCycle) {};

/**
 * Selects the previous page.
 *
 * @param shouldCycle
          If true then when the end is reached and there is no next page it selects the first page
 * @since API version 2
 */
CursorRemoteControlsPage.prototype.selectPreviousPage = function(shouldCycle) {};

/**
 * Selects the next page that matches the given expression.
 *
 * @param expression
          An expression that can match a page based on how it has been tagged. For now this can only be
          the name of a single tag that you would like to match.
 * @param shouldCycle
          If true then when the end is reached and there is no next page it selects the first page
 * @since API version 2
 */
CursorRemoteControlsPage.prototype.selectNextPageMatching = function(expression, shouldCycle) {};

/**
 * Selects the previous page that matches the given expression.
 *
 * @param expression
          An expression that can match a page based on how it has been tagged. For now this can only be
          the name of a single tag that you would like to match.
 * @param shouldCycle
          If true then when the end is reached and there is no next page it selects the first page
 * @since API version 2
 */
CursorRemoteControlsPage.prototype.selectPreviousPageMatching = function(expression, shouldCycle) {};

/**
 * Value that reports the currently selected parameter page index.
 *
 * @return {SettableIntegerValue}
 * @since API version 2
 */
CursorRemoteControlsPage.prototype.selectedPageIndex = function() {};
