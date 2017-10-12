/* API Version - 2.2 */

/**
 * Defines an extension that enabled a controller to work with Bitwig Studio.
 */
function ControllerExtensionDefinition() {}

/**
 * @return {string}
 */
ControllerExtensionDefinition.prototype.toString = function() {};

/**
 * The vendor of the controller that this extension is for.
 *
 * @return {string}
 */
ControllerExtensionDefinition.prototype.getHardwareVendor = function() {};

/**
 * The model name of the controller that this extension is for.
 *
 * @return {string}
 */
ControllerExtensionDefinition.prototype.getHardwareModel = function() {};

/**
 * The number of MIDI in ports that this controller extension has.
 *
 * @return {int}
 */
ControllerExtensionDefinition.prototype.getNumMidiInPorts = function() {};

/**
 * The number of MIDI out ports that this controller extension has.
 *
 * @return {int}
 */
ControllerExtensionDefinition.prototype.getNumMidiOutPorts = function() {};

/**
 * Obtains a {@link AutoDetectionMidiPortNamesList} that defines the names of the MIDI in and out ports
 * that can be used for auto detection of the controller for the supplied platform type.
 *
 * @param {PlatformType} platformType
 * @return {AutoDetectionMidiPortNamesList}
 */
ControllerExtensionDefinition.prototype.getAutoDetectionMidiPortNamesList = function(platformType) {};

/**
 * Lists the {@link AutoDetectionMidiPortNames} that defines the names of the MIDI in and out ports
 * that can be used for auto detection of the controller for the supplied platform type.
 *
 * @param {AutoDetectionMidiPortNamesList} list
 * @param {PlatformType} platformType
 */
ControllerExtensionDefinition.prototype.listAutoDetectionMidiPortNames = function(list, platformType) {};

/**
 * Creates an instance of this extension.
 *
 * @param {ControllerHost} host
 * @return {ControllerExtension}
 */
ControllerExtensionDefinition.prototype.createInstance = function(host) {};
