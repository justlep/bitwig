/* API Version - 2.2.3 */

/**
 * Instances of this interface are used to navigate the available sessions in Bitwig Studio's contextual
 * browser. The sessions are shown as tabs in the graphical user interface of the browser.
 *
 * @since API version 1
 */
function BrowsingSessionBank() {}

BrowsingSessionBank.prototype = new Bank();
BrowsingSessionBank.prototype.constructor = BrowsingSessionBank;

/**
 * Returns the window size that was used to configure the session bank during creation.
 *
 * @return {int} the size of the session bank.
 * @since API version 1
 */
BrowsingSessionBank.prototype.getSize = function() {};

/**
 * Returns the browser session for the given index.
 *
 * @param index
          the session index, must be in the range `[0..getSize-1]`
 * @return {GenericBrowsingSession} the requested browser session object
 * @since API version 1
 */
BrowsingSessionBank.prototype.getSession = function(index) {};
