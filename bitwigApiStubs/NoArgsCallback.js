/* API Version - 2.3.1 */

function NoArgsCallback() {}

NoArgsCallback.prototype = new Callback();
NoArgsCallback.prototype.constructor = NoArgsCallback;

NoArgsCallback.prototype.call = function() {};
