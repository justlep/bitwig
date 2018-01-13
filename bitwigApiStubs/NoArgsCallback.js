/* API Version - 2.2.3 */

function NoArgsCallback() {}

NoArgsCallback.prototype = new Callback();
NoArgsCallback.prototype.constructor = NoArgsCallback;

NoArgsCallback.prototype.call = function() {};
