/**
 * Unfinished controller script for the Behringer CMD LC-1.
 *
 * Author: Lennart Pegel - https://github.com/justlep/bitwig
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 */

loadAPI(6);
load('lep-framework/complete.js');

host.defineController('Behringer', 'CMD LC-1', '2.1', 'b6ad3828-8a3d-11e5-af63-feff819cdc9f', 'Lennart Pegel');
host.defineMidiPorts(1, 1);
host.addDeviceNameBasedDiscoveryPair(['CMD LC-1'], ['CMD LC-1']);

function init() {
    lep.setLogLevel(lep.LOGLEVEL.DEBUG);
    new lep.LC1();
}

function exit() {
}

/**
 * @constructor
 */
lep.LC1 = function() {

    var MIDI_CHANNEL = 0,
        NOTE = {
            MUTE: 64,
            SOLO: 68,
            ARM: 72,
            MATRIX: 32,
            NUM: 16
        },
        CC = {
            ENCODER0: 16
        },
        NOTE_ACTION = {
            SELECT: NOTE.MATRIX + (7 * 4),
            PREV_CHANNEL_PAGE: NOTE.MATRIX + (6 * 4) + 2,
            NEXT_CHANNEL_PAGE: NOTE.MATRIX + (6 * 4) + 3
        },
        MATRIX_COLOR = {
            OFF: 127,
            ORANGE_DEFAULT: 0,
            GREEN: 1,
            GREEN_BLINK: 2,
            PINK: 3,
            PINK_BLINK: 4,
            BLUE: 5,
            BLUE_BLINK: 6,
            ORANGE: 7,
            ORANGE_BLINK: 8
        },
        NONMATRIX_COLOR = {
            ORANGE: 0,
            BLUE: 1,
            BLUE_BLINK: 2
        },

        USER_CONTROL_PAGES = 8,
        SENDS_NUMBER = 8,
        SCENES_NUMBER = 6,
        WINDOW_SIZE = 4,
        trackBank = host.createTrackBank(WINDOW_SIZE, SENDS_NUMBER, SCENES_NUMBER),

        cursorDevice = host.createEditorCursorDevice(0),
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
                    trackBank.scrollPageForwards();
                }
            },
            PREV_DEVICE_OR_CHANNEL_PAGE: function() {
                if (isShiftPressed()) {
                    cursorDevice.selectPrevious();
                } else {
                    trackBank.scrollPageBackwards();
                }
            },
            SHIFT_CHANGE: function(note, value) {
                isShiftPressed(!!value);
            }
        },

        CONTROLSET = {
            ENCODERS: new lep.ControlSet('Encoders', WINDOW_SIZE, function(index) {
                return new lep.Encoder({
                    name: 'Encoder' + index,
                    valueCC: CC.ENCODER0 + index,
                    midiChannel: MIDI_CHANNEL,
                    diffZeroValue: 64,
                    minFeedbackValue: 1,
                    maxFeedbackValue: 15
                });
            }),
            NUM_BUTTONS: new lep.ControlSet('Num-Buttons', 8, function(index) {
                return new lep.Button({
                    name: 'NumBtn' + index,
                    clickNote: NOTE.NUM + index,
                    midiChannel: MIDI_CHANNEL
                });
            })
        },

        VALUESET = {
            VOLUME: lep.ValueSet.createVolumeValueSet(trackBank, WINDOW_SIZE),
            PAN: lep.ValueSet.createPanValueSet(trackBank, WINDOW_SIZE),
            SEND: lep.SendsValueSet.createFromTrackBank(trackBank),
            PARAM: new lep.ParamsValueSet(cursorDevice),
            USERCONTROL: lep.ValueSet.createUserControlsValueSet(USER_CONTROL_PAGES, WINDOW_SIZE, 'LC1-UC-{}-{}')
        };

    function testColors() {
        var color = 0;
        eventDispatcher.onCC(CC.ENCODER0, function(cc, value /*, channel */){
            var diff = (value - 64);
            color = lep.util.limitToRange(color + diff, 0, 127);
            lep.logDev('new color: {}', color);

            for (var note = NOTE.MATRIX, lastNote = note + 31; note <= lastNote; note++) {
                sendNoteOn(MIDI_CHANNEL, note, color);
            }
            for (var i = 0; i < 4; i++) {
                sendNoteOn(MIDI_CHANNEL, NOTE.MUTE + i, color);
                sendNoteOn(MIDI_CHANNEL, NOTE.SOLO + i, color);
                sendNoteOn(MIDI_CHANNEL, NOTE.ARM + i, color);
                sendNoteOn(MIDI_CHANNEL, NOTE.NUM + i, color);
                sendNoteOn(MIDI_CHANNEL, NOTE.NUM + 4 + i, color);
            }
        });
    }

    function initChannelButtons() {

        // Set colors for MUTE/SOLO/ARM/ChannelSelect buttons..
        lep.ToggledValue.setArmVelocityValues(NONMATRIX_COLOR.BLUE, NONMATRIX_COLOR.ORANGE);
        lep.ToggledValue.setSoloVelocityValues(NONMATRIX_COLOR.BLUE, NONMATRIX_COLOR.ORANGE);
        lep.ToggledValue.setMuteVelocityValues(NONMATRIX_COLOR.BLUE_BLINK, NONMATRIX_COLOR.ORANGE);
        lep.ChannelSelectValue.setVelocityValues(MATRIX_COLOR.GREEN, MATRIX_COLOR.OFF);

        for (var channelIndex = 0; channelIndex < WINDOW_SIZE; channelIndex++) {
            new lep.Button({
                name: 'MuteBtn' + channelIndex,
                clickNote: NOTE.MUTE + channelIndex,
                midiChannel: MIDI_CHANNEL,
                valueToAttach: lep.ToggledValue.createMuteValue(trackBank, channelIndex)
            });
            new lep.Button({
                name: 'SoloBtn' + channelIndex,
                clickNote: NOTE.SOLO + channelIndex,
                midiChannel: MIDI_CHANNEL,
                valueToAttach: lep.ToggledValue.createSoloValue(trackBank, channelIndex, prefs)
            });
            new lep.Button({
                name: 'ArmBtn' + channelIndex,
                clickNote: NOTE.ARM + channelIndex,
                midiChannel: MIDI_CHANNEL,
                valueToAttach: lep.ToggledValue.createArmValue(trackBank, channelIndex)
            });
            new lep.Button({
                name: 'SelectBtn' + channelIndex,
                clickNote: NOTE_ACTION.SELECT + channelIndex,
                midiChannel: MIDI_CHANNEL,
                valueToAttach: lep.ChannelSelectValue.create(trackBank, channelIndex)
            });
        }
    }

    function initChannelScrollButtons() {
        var hasNextPage = ko.observable(false),
            hasPrevPage = ko.observable(false);

        trackBank.canScrollChannelsDown().addValueObserver(hasNextPage);
        trackBank.canScrollChannelsUp().addValueObserver(hasPrevPage);

        new lep.Button({
            name: 'PrevPageBtn',
            clickNote: NOTE_ACTION.PREV_CHANNEL_PAGE,
            midiChannel: MIDI_CHANNEL,
            valueToAttach: new lep.KnockoutSyncedValue({
                name: 'PrevChannelPage',
                ownValue: true,
                refObservable: hasPrevPage,
                onClick: HANDLERS.PREV_DEVICE_OR_CHANNEL_PAGE,
                velocityValueOn: MATRIX_COLOR.PINK,
                velocityValueOff: MATRIX_COLOR.OFF
            })
        });

        new lep.Button({
            name: 'NextPageBtn',
            clickNote: NOTE_ACTION.NEXT_CHANNEL_PAGE,
            midiChannel: MIDI_CHANNEL,
            valueToAttach: new lep.KnockoutSyncedValue({
                name: 'NextChannelPage',
                ownValue: true,
                refObservable: hasNextPage,
                onClick: HANDLERS.NEXT_DEVICE_OR_CHANNEL_PAGE,
                velocityValueOn: MATRIX_COLOR.PINK,
                velocityValueOff: MATRIX_COLOR.OFF
            })
        });
    }

    function initAutoFollow() {
        var cursorTrack = host.createArrangerCursorTrack (0, 0);
        cursorTrack.addPositionObserver(function(trackIndex) {
            if (prefs.autoFollowSelectedTrack) {
                trackBank.scrollToChannel(trackIndex);
            }
        });
    }

    // CONTROLSET.ENCODERS.setValueSet(VALUESET.VOLUME);
    CONTROLSET.ENCODERS.setValueSet(VALUESET.PAN);

    // TODO use lep.MatrixWindow for clip matrix

    initChannelScrollButtons();
    initChannelButtons();
    initAutoFollow();
    //testColors();

    println('\n--------------\nCMD LC-1 ready');
};
