/* API Version - 2.1.3 */

/**
 * Represents a page of remote controls in a device.
 *
 * @since API version 2
 */
function RemoteControlsPage() {}

RemoteControlsPage.prototype = new ParameterBank();
RemoteControlsPage.prototype.constructor = RemoteControlsPage;

/**
 * @param {int} indexInBank
 * @return {RemoteControl}
 */
RemoteControlsPage.prototype.getParameter = function(indexInBank) {};
