/**
 * Bitwig Controller Script for the Alesis Performance Pad.
 *
 * - the 8 Pads are mapped to notes C1-G1, so they're usable for DrumMachine, D16 Drumazon, Microtonic etc.
 * - Gate time is implemented "manually" by the script and can be adjusted via preferences (default=20ms)
 *   (The PerformancePad by nature sends NoteOn/NoteOff messages too fast after another, so they're not reliably
 *    triggering devices in Bitwig)
 * - Velocity curves can be chosen via preferences (normal, fixed values, lift+20, Gamma2, Gamma3, Gamma4)
 *
 * TODO: map HiHat+Kick pedals to notes
 *
 * Author: Lennart Pegel - https://github.com/justlep/bitwig
 * License: LGPLv3 (http://www.gnu.org/licenses/lgpl-3.0.txt)
 */

loadAPI(1);

// @deprecationChecked:1.3.5
host.defineController('Alesis', 'PerformancePad', '1.0', 'c6cc8a34-a36e-11e5-bf7f-feff819cdc9f', 'Lennart Pegel <github@justlep.net>');
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
    };

function init() {
    var inPort = host.getMidiInPort(0),
        noteInput = inPort.createNoteInput('PerformancePad', '000000'), // block everything and let midiCallback do the talking
        gateTimeInMillis = 20,
        velocityTranslationTable = [],
        preferences = host.getPreferences(),
        gateSetting = preferences.getEnumSetting('Gate (ms)', 'Preferences', ['5','20','30','50','70','100'], '20'),
        velocitySetting = preferences.getEnumSetting('Velocity', 'Preferences',
                                                     ['DEFAULT','32','64','96','127','LIFT','GAMMA2', 'GAMMA3', 'GAMMA4'], 'GAMMA2');

    gateSetting.addValueObserver(function(newGate) {
        gateTimeInMillis = parseInt(newGate, 10);
        // println('Changed gate: ' + gateTimeInMillis + ' millis');
    });

    velocitySetting.addValueObserver(function(velocityMode) {
        var fixVelocity = parseInt(velocityMode, 10) || false,
            liftOffset = (velocityMode === 'LIFT') ? 20 : 0,
            gamma = (/GAMMA(\d)/.test(velocityMode)) ? parseInt(RegExp.$1, 10) : 0;

        for (var v = 0; v < 128; v++) {
            velocityTranslationTable[v] = gamma ? Math.round(127 * Math.pow(v/127, 1/gamma)) : (fixVelocity || Math.min(v + liftOffset, 127));
        }

        // println('Changed velocity mode: ' + velocityMode);
    });

    noteInput.setShouldConsumeEvents(false);

    inPort.setMidiCallback(function(status, data1, data2) {
        // printMidi(status, data1, data2);
        var targetNote = (status === 0x90) && data2 && NOTE_MAPPING[data1] || 0,
            targetVelocity;

        if (targetNote) {
            targetVelocity = velocityTranslationTable[data2];
            // println('Note (orig/target): ' + data1 + '/' + targetNote + ', Vel (orig/target): ' + data2 + '/' + targetVelocity);
            noteInput.sendRawMidiEvent(0x90, targetNote, targetVelocity);
            host.scheduleTask(function(note) {
                noteInput.sendRawMidiEvent(0x80, note, 0);
            }, [targetNote], gateTimeInMillis);
        }
    });

    println('\n--------------\nPerformancePad ready');
}

function exit() {}
