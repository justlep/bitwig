/* API Version - 2.2 */

/**
 * Defines the interface through which an extension can talk to the host application.
 */
function Host() {}

/**
 * An interface representing the host application to the script.
 * @global
 * @type {Host}
 */
var host = new Host();

/**
 * Returns the latest supported API version of the host application.
 *
 * @return {int} the latest supported API version of the host application
 * @since API version 1
 */
Host.prototype.getHostApiVersion = function() {};

/**
 * Returns the vendor of the host application.
 *
 * @return {string} the vendor of the host application
 * @since API version 1
 */
Host.prototype.getHostVendor = function() {};

/**
 * Returns the product name of the host application.
 *
 * @return {string} the product name of the host application
 * @since API version 1
 */
Host.prototype.getHostProduct = function() {};

/**
 * Returns the version number of the host application.
 *
 * @return {string} the version number of the host application
 * @since API version 1
 */
Host.prototype.getHostVersion = function() {};

/**
 * The platform type that this host is running on.
 *
 * @return {PlatformType}
 */
Host.prototype.getPlatformType = function() {};

/**
 * Sets an email address to use for reporting errors found in this script.
 *
 * @param {string} address
 * @since API version 2
 */
Host.prototype.setErrorReportingEMail = function(address) {};
