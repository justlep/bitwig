/* API Version - 2.1.3 */

/**
 * Instances of this interface are used for navigating the various browsing sessions of Bitwig Studio's
 * contextual browser.
 *
 * @since API version 1
 */
function CursorBrowsingSession() {}

CursorBrowsingSession.prototype = new GenericBrowsingSession();
CursorBrowsingSession.prototype.constructor = CursorBrowsingSession;
