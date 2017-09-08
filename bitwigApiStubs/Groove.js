/* API Version - 2.1.3 */

/**
 * An interface representing the global groove settings of the project.
 *
 * @since API version 1
 */
function Groove() {}

/**
 * Returns the enabled state of the groove.
 *
 * @return {Parameter} an object that provides access to the groove on/off setting
 * @since API version 1
 */
Groove.prototype.getEnabled = function() {};

/**
 * Returns the object that represents the shuffle amount in Bitwig Studio.
 *
 * @return {Parameter} an ranged value object that provides access to the shuffle amount
 * @since API version 1
 */
Groove.prototype.getShuffleAmount = function() {};

/**
 * Returns the object that represents the shuffle rate in Bitwig Studio.
 *
 * @return {Parameter} an ranged value object that provides access to the shuffle rate
 * @since API version 1
 */
Groove.prototype.getShuffleRate = function() {};

/**
 * Returns the object that represents the accent amount in Bitwig Studio.
 *
 * @return {Parameter} an ranged value object that provides access to the accent amount
 * @since API version 1
 */
Groove.prototype.getAccentAmount = function() {};

/**
 * Returns the object that represents the accent rate in Bitwig Studio.
 *
 * @return {Parameter} an ranged value object that provides access to the accent rate
 * @since API version 1
 */
Groove.prototype.getAccentRate = function() {};

/**
 * Returns the object that represents the accent phase in Bitwig Studio.
 *
 * @return {Parameter} an ranged value object that provides access to the accent phase
 * @since API version 1
 */
Groove.prototype.getAccentPhase = function() {};
