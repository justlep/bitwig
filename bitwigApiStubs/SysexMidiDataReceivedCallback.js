/* API Version - 2.3.1 */

function SysexMidiDataReceivedCallback() {}

SysexMidiDataReceivedCallback.prototype = new Callback();
SysexMidiDataReceivedCallback.prototype.constructor = SysexMidiDataReceivedCallback;

/**
 * @param data
          The data encoded as a hex string
 */
SysexMidiDataReceivedCallback.prototype.sysexDataReceived = function(data) {};
