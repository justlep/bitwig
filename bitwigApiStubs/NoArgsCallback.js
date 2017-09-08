/* API Version - 2.1.3 */

function NoArgsCallback() {}

NoArgsCallback.prototype = new Callback();
NoArgsCallback.prototype.constructor = NoArgsCallback;

NoArgsCallback.prototype.call = function() {};
