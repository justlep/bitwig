/**
 * Bitwig Controller Script providing 16 selectable MidiInputs for one single device.
 * Each input will pass through only one note for the drum-machine (C1 - D#2).
 * An additional input passes all of the notes mentioned above.
 *
 * Author: Lennart Pegel - https://github.com/justlep/bitwig
 * License: LGPLv3 (http://www.gnu.org/licenses/lgpl-3.0.txt)
 */

loadAPI(1);

// @deprecationChecked:1.3.9
host.defineController('Generic', 'Pads', '1.0', 'c5bb3af6-9c15-11e5-8994-feff819cdc9f', 'Lennart Pegel <github@justlep.net>');
host.defineMidiPorts(1, 0);

var MIDI_CHANNEL_MASK = '?',// by default, all channels are used; replace with single channel if needed
    FIRST_DRUM_NOTE = 0x24,  // C1
    LAST_DRUM_NOTE = 0x33,   // D#2
    NOTEON_MASK_TEMPLATE = '9cxx??'.replace('c', MIDI_CHANNEL_MASK),
    NOTEOFF_MASK_TEMPLATE = '8cxx??'.replace('c', MIDI_CHANNEL_MASK);

function init() {
    var inPort = host.getMidiInPort(0),
        allChannelNoteInputCreationParams = ['ALL'],
        noteOnMask, noteOffMask, noteInput, inputName, note;

    for (note = FIRST_DRUM_NOTE; note <= LAST_DRUM_NOTE; note++) {
        inputName = ''+ (note - FIRST_DRUM_NOTE + 1);
        noteOnMask = NOTEON_MASK_TEMPLATE.replace('xx', note.toString(16));
        noteOffMask = NOTEOFF_MASK_TEMPLATE.replace('xx', note.toString(16));
        noteInput = inPort.createNoteInput(inputName, noteOnMask, noteOffMask);
        noteInput.setShouldConsumeEvents(false);
        allChannelNoteInputCreationParams.push(noteOnMask);
        allChannelNoteInputCreationParams.push(noteOffMask);
    }

    noteInput = inPort.createNoteInput.apply(inPort, allChannelNoteInputCreationParams);
    noteInput.setShouldConsumeEvents(false);

    println('\n--------------\nDrumPads ready');
}

function exit() {}
