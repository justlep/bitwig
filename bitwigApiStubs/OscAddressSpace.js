/* API Version - 2.3.1 */

/**
 * An OSC address space.
 * 
 * It contains the root OscContainer.
 *
 * @since API version 5
 */
function OscAddressSpace() {}

/**
 * Register all the methods annotated with @OscMethod from object.
 * Also if a method is annotated with @OscNode, this method will be called and the returned object's method
 * will be registered.
 *
 * @param {string} addressPrefix
 * @param {Object} object
 * @throws OscInvalidArgumentTypeException
 */
OscAddressSpace.prototype.registerObjectMethods = function(addressPrefix, object) {};

/**
 * Low level way to register an Osc Method.
 *
 * @param {string} address The address to register the method at
 * @param {string} typeTagPattern The globing pattern used to match the type tag. Pass "*" to match anything.
 * @param {string} desc The method description.
 * @param {OscMethodCallback} callback Then call handler.
 */
OscAddressSpace.prototype.registerMethod = function(address, typeTagPattern, desc, callback) {};

/**
 * This method will be called if no registered OscMethod could handle incoming OscPacket.
 *
 * @param {OscMethodCallback} callback
 */
OscAddressSpace.prototype.registerDefaultMethod = function(callback) {};

/**
 * Should the address spaces log the messages it dispatches?
 * Default is false.
 *
 * @param {boolean} shouldLogMessages
 */
OscAddressSpace.prototype.setShouldLogMessages = function(shouldLogMessages) {};

/**
 * This gives a display name for this address space.
 * It is useful if you have multiple address space to identify them when we generate the documentation.
 *
 * @param {string} name
 */
OscAddressSpace.prototype.setName = function(name) {};
