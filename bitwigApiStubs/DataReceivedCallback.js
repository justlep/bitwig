/* API Version - 2.2.3 */

function DataReceivedCallback() {}

DataReceivedCallback.prototype = new Callback();
DataReceivedCallback.prototype.constructor = DataReceivedCallback;

/**
 * @param {byte[]} data
 */
DataReceivedCallback.prototype.dataReceived = function(data) {};
