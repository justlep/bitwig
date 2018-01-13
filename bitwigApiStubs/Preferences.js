/* API Version - 2.2.3 */

/**
 * This interface is used to store custom controller settings into the Bitwig Studio preferences. The settings
 * are shown to the user in the controller preferences dialog of Bitwig Studio.
 *
 * @since API version 1
 */
function Preferences() {}

Preferences.prototype = new Settings();
Preferences.prototype.constructor = Preferences;
