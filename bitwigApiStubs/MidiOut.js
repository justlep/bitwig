/* API Version - 2.3.1 */

/**
 * Instances of this interface are used to send MIDI messages to a specific MIDI hardware.
 *
 * @since API version 1
 */
function MidiOut() {}

/**
 * Sends a MIDI message to the hardware device.
 *
 * @param status
          the status byte of the MIDI message
 * @param data1
          the data1 part of the MIDI message
 * @param data2
          the data2 part of the MIDI message
@since API version 1
 */
MidiOut.prototype.sendMidi = function(status, data1, data2) {};

/**
 * Sends a MIDI SysEx message to the hardware device.
 *
 * @param hexString
          the sysex message formatted as hexadecimal value string
@since API version 1
 */
MidiOut.prototype.sendSysex = function(hexString) {};

/**
 * Sends a MIDI SysEx message to the hardware device.
 *
 * @param hexString
          the sysex message formatted as hexadecimal value string
@since API version 1
 */
MidiOut.prototype.sendSysex = function(data) {};
