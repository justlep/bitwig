/**
 * Bitwig Controller Script for the Alesis Performance Pad.
 *
 * - the 8 Pads are mapped to notes C1-G1, so they're usable for DrumMachine, D16 Drumazon, Microtonic etc.
 * - Gate time is implemented "manually" by the script and can be adjusted via preferences (default=20ms)
 *   (The PerformancePad by nature sends NoteOn/NoteOff messages too fast after another, so they're not reliably
 *    triggering devices in Bitwig)
 * - Velocity curves can be chosen via preferences (normal, fixed values, lift+20, Gamma2, Gamma3, Gamma4)
 *
 * Author: Lennart Pegel - https://github.com/justlep/bitwig
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 */

loadAPI(2);

// @deprecationChecked:1.3.15
host.defineController('Alesis', 'PerformancePad', '2.0', 'c6cc8a34-a36e-11e5-bf7f-feff819cdc9f', 'Lennart Pegel <github@justlep.net>');
host.defineMidiPorts(1, 0);

var NOTE_MAPPING = {
        0x24: 0x24, // left bottom pad => C1
        0x26: 0x25,
        0x2a: 0x26,
        0x2e: 0x27,
        0x30: 0x28,
        0x2D: 0x29,
        0x31: 0x2A,
        0x33: 0x2B // top right pad => mapped to G1
    },
    GATE_OPTIONS = ['5', '20', '30', '50', '70', '100'],
    DEFAULT_GATE_OPTION = '20',
    VELOCITY_MODES = ['ADD-20', 'ADD-30', 'FIX-30', 'FIX-60', 'FIX-90', 'FIX-110', 'FIX-127', 'GAMMA-2', 'GAMMA-3', 'GAMMA-4', 'LINEAR'],
    DEFAULT_VELOCITY_MODE = 'GAMMA-2';


function init() {
    var inPort = host.getMidiInPort(0),
        noteInput = inPort.createNoteInput('Pads', '000000'), // block everything and let midiCallback do the talking
        gateTimeInMillis = 20,
        velocityTranslationTable = [],
        preferences = host.getPreferences(),
        gateSetting = preferences.getEnumSetting('Gate (ms)', 'Preferences', GATE_OPTIONS, DEFAULT_GATE_OPTION),
        velocitySetting = preferences.getEnumSetting('Velocity Curve', 'Preferences', VELOCITY_MODES, DEFAULT_VELOCITY_MODE),
        notesRemapSetting = preferences.getEnumSetting('Remap pads', 'Preferences', ['C1 to G1','NO'], 'C1 to G1'),
        isNoteRemapEnabled = true,
        HANDLERS = {
            MIDI: function(status, data1, data2) {
                // printMidi(status, data1, data2);
                if (status !== 0x90 || !data2) return;  // ignore anything that is not note-on

                var targetNote = isNoteRemapEnabled ? NOTE_MAPPING[data1] : data1,
                    targetVelocity;

                if (targetNote) {
                    targetVelocity = velocityTranslationTable[data2];
                    // println('Note (orig/target): ' + data1 + '/' + targetNote + ', Vel (orig/target): ' + data2 + '/' + targetVelocity);
                    noteInput.sendRawMidiEvent(0x90, targetNote, targetVelocity);
                    host.scheduleTask(HANDLERS.TIMED_NOTE_OFF, [targetNote], gateTimeInMillis);
                }
            },
            TIMED_NOTE_OFF: function(note) {
                noteInput.sendRawMidiEvent(0x80, note, 0);
            }
        };

    gateSetting.addValueObserver(function(newGate) {
        gateTimeInMillis = parseInt(newGate, 10);
        // println('Changed gate: ' + gateTimeInMillis + ' millis');
    });

    velocitySetting.addValueObserver(function(velocityMode) {
        var fixVelocity = /FIX-(\d+)/.test(velocityMode) ? parseInt(RegExp.$1, 10) : false,
            liftOffset = /ADD-(\d+)/.test(velocityMode) ? parseInt(RegExp.$1, 10) : 0,
            gamma = (/GAMMA-(\d)/.test(velocityMode)) ? parseInt(RegExp.$1, 10) : 0;

        for (var v = 0; v < 128; v++) {
            velocityTranslationTable[v] = gamma ? Math.round(127 * Math.pow(v/127, 1/gamma)) : (fixVelocity || Math.min(v + liftOffset, 127));
        }

        // println('Changed velocity mode: ' + velocityMode);
    });

    notesRemapSetting.addValueObserver(function(remap) {
        isNoteRemapEnabled = (remap !== 'NO');
        println('Note remap enabled: ' + isNoteRemapEnabled);
    });

    noteInput.setShouldConsumeEvents(false);
    inPort.setMidiCallback(HANDLERS.MIDI);

    println('\n--------------\nPerformancePad ready');
}

function exit() {}
