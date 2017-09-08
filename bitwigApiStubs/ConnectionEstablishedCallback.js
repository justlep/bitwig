/* API Version - 2.1.3 */

function ConnectionEstablishedCallback() {}

ConnectionEstablishedCallback.prototype = new Callback();
ConnectionEstablishedCallback.prototype.constructor = ConnectionEstablishedCallback;

/**
 * @param {RemoteConnection} connection
 */
ConnectionEstablishedCallback.prototype.connectionEstablished = function(connection) {};
