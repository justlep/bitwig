/* API Version - 2.3.1 */

/**
 * Interface to create Osc related object.
 *
 * @since API version 5
 */
function OscModule() {}

/**
 * Creates a new OscAddressSpace.
 * 
 * In short the OscAddressSpace dispatches the incoming messages to services.
 * An OscAddressSpace is an OscService.
 *
 * @return {OscAddressSpace}
 * @since API version 5
 */
OscModule.prototype.createAddressSpace = function() {};

/**
 * Creates a new OSC Server.
 *
 * @param {int} port
 * @param {OscAddressSpace} addressSpace
 * @return {void} a new OscServer
 * @since API version 5
 */
OscModule.prototype.createUdpServer = function(port, addressSpace) {};

/**
 * Tries to connect to an OscServer.
 *
 * @param {string} host
 * @param {int} port
 * @param {OscAddressSpace} addressSpace
 * @return {OscConnection} a new OscConnection
 * @since API version 5
 */
OscModule.prototype.connectToUdpServer = function(host, port, addressSpace) {};
