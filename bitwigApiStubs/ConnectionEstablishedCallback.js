/* API Version - 2.3.1 */

function ConnectionEstablishedCallback() {}

ConnectionEstablishedCallback.prototype = new Callback();
ConnectionEstablishedCallback.prototype.constructor = ConnectionEstablishedCallback;

/**
 * @param {RemoteConnection} connection
 */
ConnectionEstablishedCallback.prototype.connectionEstablished = function(connection) {};
