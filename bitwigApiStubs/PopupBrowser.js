/* API Version - 2.2 */

/**
 * Object that represents the popup browser in Bitwig Studio.
 *
 * @since API version 2
 */
function PopupBrowser() {}

PopupBrowser.prototype = new ObjectProxy();
PopupBrowser.prototype.constructor = PopupBrowser;

/**
 * The title of the popup browser.
 *
 * @return {StringValue}
 * @since API version 2
 */
PopupBrowser.prototype.title = function() {};

/**
 * Value that reports the possible content types that can be inserted by the popup browser. These are
 * represented by the tabs in Bitwig Studio's popup browser.
 * 
 * (e.g "Device", "Preset", "Sample" etc.)
 *
 * @return {StringArrayValue}
 * @since API version 2
 */
PopupBrowser.prototype.contentTypeNames = function() {};

/**
 * Value that represents the selected content type.
 *
 * @return {StringValue}
 * @since API version 2
 */
PopupBrowser.prototype.selectedContentTypeName = function() {};

/**
 * Value that represents the index of the selected content type within the content types supported.
 *
 * @return {SettableIntegerValue}
 * @since API version 2
 */
PopupBrowser.prototype.selectedContentTypeIndex = function() {};

/**
 * The smart collections column of the browser.
 *
 * @return {BrowserFilterColumn}
 * @since API version 2
 */
PopupBrowser.prototype.smartCollectionColumn = function() {};

/**
 * The location column of the browser.
 *
 * @return {BrowserFilterColumn}
 * @since API version 2
 */
PopupBrowser.prototype.locationColumn = function() {};

/**
 * The device column of the browser.
 *
 * @return {BrowserFilterColumn}
 * @since API version 2
 */
PopupBrowser.prototype.deviceColumn = function() {};

/**
 * The category column of the browser.
 *
 * @return {BrowserFilterColumn}
 * @since API version 2
 */
PopupBrowser.prototype.categoryColumn = function() {};

/**
 * The tag column of the browser.
 *
 * @return {BrowserFilterColumn}
 * @since API version 2
 */
PopupBrowser.prototype.tagColumn = function() {};

/**
 * The device type column of the browser.
 *
 * @return {BrowserFilterColumn}
 * @since API version 2
 */
PopupBrowser.prototype.deviceTypeColumn = function() {};

/**
 * The file type column of the browser.
 *
 * @return {BrowserFilterColumn}
 * @since API version 2
 */
PopupBrowser.prototype.fileTypeColumn = function() {};

/**
 * The creator column of the browser.
 *
 * @return {BrowserFilterColumn}
 * @since API version 2
 */
PopupBrowser.prototype.creatorColumn = function() {};

/**
 * Column that represents the results of the search.
 *
 * @return {BrowserResultsColumn}
 * @since API version 2
 */
PopupBrowser.prototype.resultsColumn = function() {};

/**
 * Value that indicates if the browser is able to audition material in place while browsing.
 *
 * @return {BooleanValue}
 * @since API version 2
 */
PopupBrowser.prototype.canAudition = function() {};

/**
 * Value that decides if the browser is currently auditioning material in place while browsing or not.
 *
 * @return {SettableBooleanValue}
 * @since API version 2
 */
PopupBrowser.prototype.shouldAudition = function() {};

/**
 * Selects the next file.
 *
 * @since API version 2
 */
PopupBrowser.prototype.selectNextFile = function() {};

/**
 * Selects the previous file.
 *
 * @since API version 2
 */
PopupBrowser.prototype.selectPreviousFile = function() {};

/**
 * Selects the first file.
 *
 * @since API version 2
 */
PopupBrowser.prototype.selectFirstFile = function() {};

/**
 * Selects the last file.
 *
 * @since API version 2
 */
PopupBrowser.prototype.selectLastFile = function() {};

/**
 * Cancels the popup browser.
 *
 * @since API version 2
 */
PopupBrowser.prototype.cancel = function() {};

/**
 * Commits the selected item in the popup browser.
 *
 * @since API version 2
 */
PopupBrowser.prototype.commit = function() {};
