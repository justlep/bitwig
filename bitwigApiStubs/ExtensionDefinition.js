/* API Version - 2.2.3 */

/**
 * Base class for defining any kind of extension for Bitwig Studio.
 */
function ExtensionDefinition() {}

/**
 * The name of the extension.
 *
 * @return {string}
 */
ExtensionDefinition.prototype.getName = function() {};

/**
 * The author of the extension.
 *
 * @return {string}
 */
ExtensionDefinition.prototype.getAuthor = function() {};

/**
 * The version of the extension.
 *
 * @return {string}
 */
ExtensionDefinition.prototype.getVersion = function() {};

/**
 * A unique id that identifies this extension.
 *
 * @return {java.util.UUID}
 */
ExtensionDefinition.prototype.getId = function() {};

/**
 * The minimum API version number that this extensions requires.
 *
 * @return {int}
 */
ExtensionDefinition.prototype.getRequiredAPIVersion = function() {};

/**
 * Gets a path within the extension's jar file where documentation for this extension can be found or null
 * if there is none. At the moment this file needs to be a PDF file but other file formats maybe supported
 * in the future.
 *
 * @return {string}
 */
ExtensionDefinition.prototype.getHelpFilePath = function() {};

/**
 * If true then this extension should fail when it calls a deprecated method in the API. This is useful
 * during development.
 *
 * @return {boolean}
 */
ExtensionDefinition.prototype.shouldFailOnDeprecatedUse = function() {};

/**
 * An e-mail address that can be used to contact the author of this extension if a problem is detected with
 * it or null if none.
 *
 * @return {string}
 */
ExtensionDefinition.prototype.getErrorReportingEMail = function() {};

/**
 * @return {string}
 */
ExtensionDefinition.prototype.toString = function() {};
