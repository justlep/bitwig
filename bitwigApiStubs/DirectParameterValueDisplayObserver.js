/* API Version - 2.3.1 */

/**
 * This interface is used to configure observation of pretty-printed device parameter values.
 *
 * @since API version 1
 */
function DirectParameterValueDisplayObserver() {}

/**
 * Starts observing the parameters according to the given parameter ID array, or stops observing in case
 * `null` is passed in for the parameter ID array.
 *
 * @param parameterIds
          the array of parameter IDs or `null` to stop observing parameter display values.
 * @since API version 1
 */
DirectParameterValueDisplayObserver.prototype.setObservedParameterIds = function(parameterIds) {};
