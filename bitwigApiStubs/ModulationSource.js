/* API Version - 2.3.1 */

/**
 * This interface represents a modulation source in Bitwig Studio.
 *
 * @since API version 1
 */
function ModulationSource() {}

/**
 * Value which reports when the modulation source is in mapping mode.
 *
 * @return {BooleanValue}
 * @since API version 2
 */
ModulationSource.prototype.isMapping = function() {};

/**
 * Toggles the modulation source between mapping mode and normal control functionality.
 *
 * @since API version 1
 */
ModulationSource.prototype.toggleIsMapping = function() {};

/**
 * Value the reports the name of the modulation source.
 *
 * @return {StringValue}
 * @since API version 2
 */
ModulationSource.prototype.name = function() {};

/**
 * Value which reports if the modulation source is mapped to any destination(s).
 *
 * @return {BooleanValue}
 * @since API version 2
 */
ModulationSource.prototype.isMapped = function() {};
