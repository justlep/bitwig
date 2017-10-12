/* API Version - 2.2 */

function DirectParameterNameChangedCallback() {}

DirectParameterNameChangedCallback.prototype = new Callback();
DirectParameterNameChangedCallback.prototype.constructor = DirectParameterNameChangedCallback;

/**
 * @param {string} id
 * @param {string} name
 */
DirectParameterNameChangedCallback.prototype.directParameterNameChanged = function(id, name) {};
