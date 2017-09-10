/**
 * Basic Bitwig Controller Script for the Akai APC mini.
 *
 * Author: Lennart Pegel - https://github.com/justlep/bitwig
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 */

/** @var ControllerHost host */

loadAPI(2);
load('lep/api.js');

host.defineController('Akai', 'APC mini', '0.1', '086a5ace-94b9-11e7-abc4-cec278b6b50a', 'Lennart Pegel');
host.defineMidiPorts(1, 1);

/** @override */
function init() {
    lep.setLogLevel(lep.LOGLEVEL.DEV);
    //new lep.BCR2000(28, 12);
    new ApcMini();
}

/**
 * @constructor
 */
function ApcMini() {
    const MIDI_CHANNEL = 0,
        CLIP_MATRIX_TRACKS = 8,
        CLIP_MATRIX_SCENES = 8,
        NOTE = {
            START_NOTE_BY_ROW: [56, 48, 40, 32, 24, 16, 8, 0],
            FIRST_SIDE_BUTTON: 82,
            FIRST_BOTTOM_BUTTON: 64,
            SHIFT_BUTTON: 98
        },
        ACTION_NOTE = {
            MATRIX_UP: NOTE.FIRST_BOTTOM_BUTTON,
            MATRIX_DOWN: NOTE.FIRST_BOTTOM_BUTTON + 1,
            MATRIX_LEFT: NOTE.FIRST_BOTTOM_BUTTON + 2,
            MATRIX_RIGHT: NOTE.FIRST_BOTTOM_BUTTON + 3
        },
        CC = {
            FIRST_FADER: 48
        },
        COLOR = {
            OFF: 0,
            GREEN: 1,
            GREEN_BLINK: 2,
            RED: 3,
            RED_BLINK: 4,
            YELLOW: 5,
            YELLOW_BLINK: 6
        };

    var eventDispatcher = lep.MidiEventDispatcher.getInstance(),
        clipWindow = lep.ClipWindow.createMain(CLIP_MATRIX_TRACKS, 0, CLIP_MATRIX_SCENES),
        isShiftPressed = ko.observable(false).updatedBy(function() {
            eventDispatcher.onNote(NOTE.SHIFT_BUTTON, function(note, value) {
                isShiftPressed(!!value);
                lep.logDev('Shift: {}', !!value);
            });
        }),
        CONTROLSET = {
            MATRIX: clipWindow.createMatrixControlSet(function(colIndex, rowIndex, absoluteIndex) {
                return new lep.Button({
                    name: lep.util.formatString('MatrixBtn {}:{}', colIndex, rowIndex),
                    clickNote: NOTE.START_NOTE_BY_ROW[rowIndex] + colIndex
                });
            })
        },
        VALUESET = {
            LAUNCHER_SLOTS: clipWindow.createLauncherSlotValueSet(function(launcherSlot) {
                return new lep.KnockoutSyncedValue({
                    name: lep.util.formatString('{}Value', launcherSlot.name),
                    ownValue: true,
                    refObservable: launcherSlot.state,
                    onClick: function() {
                        launcherSlot.toggle();
                    },
                    computedVelocity: ko.computed(function() {
                        if (!launcherSlot.hasContent()) {
                            return COLOR.OFF;
                        }
                        var state = launcherSlot.state(),
                            newColor = (state === lep.LauncherSlot.STATE.STOPPED) ? COLOR.GREEN :
                               (state === lep.LauncherSlot.STATE.PLAY_QUEUED) ? COLOR.YELLOW_BLINK :
                               (state === lep.LauncherSlot.STATE.PLAYING) ? COLOR.YELLOW :
                               (state === lep.LauncherSlot.STATE.STOP_QUEUED) ? COLOR.GREEN_BLINK :
                               (state === lep.LauncherSlot.STATE.OTHER) ? COLOR.RED_BLINK :
                                   COLOR.RED;

                        return newColor;
                    })
                });
            })
        };

    function initScrollButtons() {
        new lep.Button({
            name: 'UpBtn',
            clickNote: ACTION_NOTE.MATRIX_UP,
            midiChannel: MIDI_CHANNEL,
            valueToAttach: new lep.KnockoutSyncedValue({
                name: 'MatrixUp',
                ownValue: true,
                refObservable: clipWindow.canMoveSceneBack,
                onClick: clipWindow.moveSceneBack,
                velocityValueOn: COLOR.GREEN,
                velocityValueOff: COLOR.OFF
            })
        });
        new lep.Button({
            name: 'DownBtn',
            clickNote: ACTION_NOTE.MATRIX_DOWN,
            midiChannel: MIDI_CHANNEL,
            valueToAttach: new lep.KnockoutSyncedValue({
                name: 'MatrixDown',
                ownValue: true,
                refObservable: clipWindow.canMoveSceneForth,
                onClick: clipWindow.moveSceneForth,
                velocityValueOn: COLOR.GREEN,
                velocityValueOff: COLOR.OFF
            })
        });
        new lep.Button({
            name: 'LeftBtn',
            clickNote: ACTION_NOTE.MATRIX_LEFT,
            midiChannel: MIDI_CHANNEL,
            valueToAttach: new lep.KnockoutSyncedValue({
                name: 'MatrixLeft',
                ownValue: true,
                refObservable: clipWindow.canMoveChannelBack,
                onClick: clipWindow.moveChannelBack,
                velocityValueOn: COLOR.GREEN,
                velocityValueOff: COLOR.OFF
            })
        });
        new lep.Button({
            name: 'RightBtn',
            clickNote: ACTION_NOTE.MATRIX_RIGHT,
            midiChannel: MIDI_CHANNEL,
            valueToAttach: new lep.KnockoutSyncedValue({
                name: 'MatrixRight',
                ownValue: true,
                refObservable: clipWindow.canMoveChannelForth,
                onClick: clipWindow.moveChannelForth,
                velocityValueOn: COLOR.GREEN,
                velocityValueOff: COLOR.OFF
            })
        });
    }

    initScrollButtons();

    CONTROLSET.MATRIX.setValueSet(VALUESET.LAUNCHER_SLOTS);

    lep.logDev('APC mini ready');
}

/** @override */
function exit() {}