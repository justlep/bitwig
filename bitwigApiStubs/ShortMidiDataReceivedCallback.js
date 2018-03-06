/* API Version - 2.3.1 */

function ShortMidiDataReceivedCallback() {}

ShortMidiDataReceivedCallback.prototype = new Callback();
ShortMidiDataReceivedCallback.prototype.constructor = ShortMidiDataReceivedCallback;

/**
 * Registers a callback for receiving short (normal) MIDI messages on this MIDI input port.
 *
 * @param {int} statusByte
 * @param {int} data1
 * @param {int} data2
 */
ShortMidiDataReceivedCallback.prototype.midiReceived = function(statusByte, data1, data2) {};
