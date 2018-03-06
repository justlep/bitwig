/* API Version - 2.3.1 */

/**
 * Defines a bank of parameters.
 *
 * @since API version 2
 */
function ParameterBank() {}

/**
 * Gets the number of slots that these remote controls have.
 *
 * @return {int}
 * @since API version 2
 */
ParameterBank.prototype.getParameterCount = function() {};

/**
 * Returns the parameter at the given index within the bank.
 *
 * @param indexInBank
          the parameter index within this bank. Must be in the range [0..getParameterCount()-1].
 * @return {Parameter} the requested parameter
 * @since API version 2
 */
ParameterBank.prototype.getParameter = function(indexInBank) {};
