/* API Version - 2.3.1 */

/**
 * This interface represents a chain selector device which can be:
 * - instrument selector
 * - effect selector
 *
 * @since API version 6
 */
function ChainSelector() {}

ChainSelector.prototype = new ObjectProxy();
ChainSelector.prototype.constructor = ChainSelector;

/**
 * The index of the active chain in the chain selector.
 * In case the chain selector has no chains or the value is not connected to the chain selector,
 * then the value will be 0.
 *
 * @return {SettableIntegerValue}
 * @since API version 6
 */
ChainSelector.prototype.activeChainIndex = function() {};

/**
 * The number of chains in the chain selector.
 *
 * @return {IntegerValue}
 * @since API version 6
 */
ChainSelector.prototype.chainCount = function() {};

/**
 * The active device layer.
 *
 * @return {DeviceLayer}
 * @since API version 6
 */
ChainSelector.prototype.activeChain = function() {};

/**
 * Cycle to the next chain.
 * If the current active chain is the last one, then moves to the first one.
 *
 * @since API version 6
 */
ChainSelector.prototype.cycleNext = function() {};

/**
 * Cycle to the previous chain.
 * If the current active chain the first one, then moves to the last one.
 *
 * @since API version 6
 */
ChainSelector.prototype.cyclePrevious = function() {};
