/**
 * Bitwig Controller Script for the Behringer CMD DC-1.
 *
 * Author: Lennart Pegel - https://github.com/justlep/bitwig
 * License: LGPLv3 (http://www.gnu.org/licenses/lgpl-3.0.txt)
 */

loadAPI(1);
load('lep/api.js');

// @deprecationChecked:1.3.5
host.defineController('Behringer', 'CMD DC-1 (LeP)', '1.0', '047f0d84-8ace-11e5-af63-feff819cdc9f', 'Lennart Pegel <github@justlep.net>');
host.defineMidiPorts(1, 1);
host.addDeviceNameBasedDiscoveryPair(['CMD DC-1'], ['CMD DC-1']);

function init() {
    lep.setLogLevel(lep.LOGLEVEL.DEV);
    new lep.DC1();
}

function exit() {
}

/**
 * @constructor
 */
lep.DC1 = function() {

    var MIDI_CHANNEL = 5,
        NOTE = {
            PUSH_ENCODER_CLICK: 32,
            FIRST_TOP_BUTTON: 0, // ascending left-to-right, top-to-bottom; i.e. second row starting with 4
            FIRST_NUM: 16,
            PAD1: 36
        },
        CC = {
            PUSH_ENCODER: 32,
            FIRST_ENCODER: 16
        },

        /**
         * Button color velocities. Push encoder color can not be changed.
         * Lights can't be turned off completely.
         */
        COLOR = {
            ORANGE: 0,
            BLUE: 1,
            BLUE_BLINK: 2
        },

        SENDS_NUMBER = 0,
        WINDOW_SIZE = 4,
        trackBank = host.createTrackBank(WINDOW_SIZE, SENDS_NUMBER, 0),

        cursorDevice = host.createEditorCursorDevice(),
        eventDispatcher = lep.MidiEventDispatcher.getInstance(),
        isShiftPressed = ko.observable(false),

        prefs = {
            soloExclusive: false,
            autoFollowSelectedTrack: true
        },

        HANDLERS = {
            NEXT_DEVICE_OR_CHANNEL_PAGE: function() {
                if (isShiftPressed()) {
                    cursorDevice.selectNext();
                } else {
                    trackBank.scrollChannelsPageDown();
                }
            },
            PREV_DEVICE_OR_CHANNEL_PAGE: function() {
                if (isShiftPressed()) {
                    cursorDevice.selectPrevious();
                } else {
                    trackBank.scrollChannelsPageUp();
                }
            },
            SHIFT_CHANGE: function(note, value) {
                isShiftPressed(!!value);
            }
        };

    function testColors() {
        var color = 0,
            updateButtonColors = function() {
                lep.logDev('Color: {}', color);

                for (var note = NOTE.PAD1, lastNote = note + 15; note <= lastNote; note++) {
                    sendNoteOn(MIDI_CHANNEL, note, color);
                }
                for (var i = 0; i < 8; i++) {
                    sendNoteOn(MIDI_CHANNEL, NOTE.FIRST_TOP_BUTTON + i, color);
                    sendNoteOn(MIDI_CHANNEL, NOTE.FIRST_NUM + i, color);
                }
            };

        eventDispatcher.onCC(CC.PUSH_ENCODER, function(cc, value, channel){
            var diff = (value - 64);
            color = lep.util.limitToRange(color + diff, 0, 127);
            updateButtonColors();
        });

        eventDispatcher.onNote(NOTE.PUSH_ENCODER_CLICK, function(note, value, channel) {
            color = 0;
            updateButtonColors();
        });
    }

    testColors();

    println('\n--------------\nCMD DC-1 ready');
};
