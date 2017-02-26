/**
 * Bitwig Controller Script for the Roland A-49.
 *
 * Author: Lennart Pegel - https://github.com/justlep/bitwig
 * License: LGPLv3 (http://www.gnu.org/licenses/lgpl-3.0.txt)
 */

loadAPI(2);

// @deprecationChecked:1.3.15
host.defineController('Roland', 'A-49', '1.0', '381d879c-9a0a-11e5-8994-feff819cdc9f', 'Lennart Pegel <github@justlep.net>');
host.defineMidiPorts(1, 0);
host.addDeviceNameBasedDiscoveryPair(['A-Series Keyboard'], []);

var MIDI_CHANNEL = 0,
    CC = {
        VOL: 7,
        C1: 0x4A,
        C2: 0x47,
        SUPER_NATURAL_C1: 0x10,
        SUPER_NATURAL_C2: 0x11,
        SUPER_NATURAL_S1: 0x50, // momentary
        SUPER_NATURAL_S2: 0x51  // momentary
    };

function init() {
    var inPort = host.getMidiInPort(0),
        filterMask = '?x????'.replace('x', MIDI_CHANNEL.toString(16)),
        noteInput = inPort.createNoteInput('Keys', filterMask), // null as filterMask crashes Bitwig despite API doc says otherwise
        userControlBank = host.createUserControls(1),
        channelAftertouchAsUserControl = userControlBank.getControl(0);

    // By default, D-Beam control in "ASSIGN" mode sends ChannelAftertouch messages
    // which Bitwig seems to ignore. Let's make them mappable anyway as a UserControl..
    channelAftertouchAsUserControl.setLabel('Aftertouch');

    noteInput.setShouldConsumeEvents(false);

    inPort.setMidiCallback(function(status, data1, data2) {
        if (status === (0xD0 + MIDI_CHANNEL)) {
            channelAftertouchAsUserControl.set(data1, 128);
        }
    });

    println('\n--------------\nRoland A-49 ready');
}

function exit() {}
