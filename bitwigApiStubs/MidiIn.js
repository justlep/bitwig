/* API Version - 2.3.1 */

/**
 * Instances of this interface are used to setup handler functions for incoming MIDI messages from a specific
 * MIDI hardware.
 *
 * @since API version 1
 */
function MidiIn() {}

/**
 * Registers a callback for receiving short (normal) MIDI messages on this MIDI input port.
 *
 * @param callback
          a callback function that receives three integer parameters: 1. the status byte 2. the data1
          value 2. the data2 value
@since API version 1
 */
MidiIn.prototype.setMidiCallback = function(callback) {};

/**
 * Registers a callback for receiving sysex MIDI messages on this MIDI input port.
 *
 * @param callback
          a callback function that takes a single string argument
@since API version 1
 */
MidiIn.prototype.setSysexCallback = function(callback) {};

/**
 * Creates a note input that appears in the track input choosers in Bitwig Studio. This method must be
 * called within the `init()` function of the script. The messages matching the given mask parameter will
 * be fed directly to the application, and are not processed by the script.
 *
 * @param name
          the name of the note input as it appears in the track input choosers in Bitwig Studio
 * @param masks
          a filter string formatted as hexadecimal value with `?` as wildcard. For example `80????`
          would match note-off on channel 1 (0). When this parameter is {@null}, a standard filter will
          be used to forward note-related messages on channel 1 (0).

          If multiple note input match the same MIDI event then they'll all receive the MIDI event, and
          if one of them does not consume events then the events wont' be consumed.
 * @return {NoteInput} the object representing the requested note input
 * @since API version 1
 */
MidiIn.prototype.createNoteInput = function(name, /*...*/masks) {};
