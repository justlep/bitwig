/* API Version - 2.3.1 */

function ShortMidiMessageReceivedCallback() {}

ShortMidiMessageReceivedCallback.prototype = new ShortMidiDataReceivedCallback();
ShortMidiMessageReceivedCallback.prototype.constructor = ShortMidiMessageReceivedCallback;

/**
 * Registers a callback for receiving short (normal) MIDI messages on this MIDI input port.
 *
 * @param callback
          a callback function that receives a ShortMidiMessage instance.
@since API version 2
 */
ShortMidiMessageReceivedCallback.prototype.midiReceived = function(msg) {};

/**
 * @param {int} statusByte
 * @param {int} data1
 * @param {int} data2
 */
ShortMidiMessageReceivedCallback.prototype.midiReceived = function(statusByte, data1, data2) {};
