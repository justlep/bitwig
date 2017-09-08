/* API Version - 2.1.3 */

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
