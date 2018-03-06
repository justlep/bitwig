/* API Version - 2.3.1 */

/**
 * This interface is used to save custom script settings inside Bitwig Studio documents. The settings are
 * shown to the user in the `Studio IO` panel of Bitwig Studio.
 *
 * @since API version 1
 */
function DocumentState() {}

DocumentState.prototype = new Settings();
DocumentState.prototype.constructor = DocumentState;
