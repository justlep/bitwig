/* API Version - 2.2.3 */

/**
 * @since API version 2
 */
function ObjectArrayValue() {}

ObjectArrayValue.prototype = new Value();
ObjectArrayValue.prototype.constructor = ObjectArrayValue;

/**
 * @return {ObjectType[]}
 * @since API version 2
 */
ObjectArrayValue.prototype.get = function() {};

/**
 * @param {int} index
 * @return {ObjectType}
 * @since API version 2
 */
ObjectArrayValue.prototype.get = function(index) {};
