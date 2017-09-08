/* API Version - 2.1.3 */

/**
 * Instances of this interface are used to categorize actions in Bitwig Studio. The list of action categories
 * provided by Bitwig Studio can be queried by calling {@link Application#getActionCategories()}. To receive a
 * specific action category call {@link Application#getActionCategory(String)}.
 *
 * @see Application#getActionCategories()
 * @see Application#getActionCategory(String)
 * @since API version 1
 */
function ActionCategory() {}

/**
 * Returns a string the identifies this action category uniquely.
 *
 * @return {string} the identifier string
 * @since API version 1
 */
ActionCategory.prototype.getId = function() {};

/**
 * Returns the name of this action category.
 *
 * @return {string} the name string
 * @since API version 1
 */
ActionCategory.prototype.getName = function() {};

/**
 * Lists all actions in this category.
 *
 * @return {Action[]} the array of actions in this category
 * @since API version 1
 */
ActionCategory.prototype.getActions = function() {};
