/* API Version - 2.3.1 */

/**
 * Interface for an object that acts as a proxy for the actual object in Bitwig Studio (for example a track, a
 * device etc).
 *
 * @since API version 2
 */
function ObjectProxy() {}

ObjectProxy.prototype = new Subscribable();
ObjectProxy.prototype.constructor = ObjectProxy;

/**
 * Returns a value object that indicates if the object being proxied exists, or if it has content.
 *
 * @return {BooleanValue}
 */
ObjectProxy.prototype.exists = function() {};

/**
 * Creates a {@link BooleanValue} that determines this proxy is considered equal to another proxy. For this
 * to be the case both proxies need to be proxying the same target object.
 *
 * @param {ObjectProxy} other
 * @return {BooleanValue}
 * @since API version 3
 */
ObjectProxy.prototype.createEqualsValue = function(other) {};
