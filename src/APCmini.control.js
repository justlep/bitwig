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
    host.getNotificationSettings().getUserNotificationsEnabled().set(true);
    new ApcMini();
}

/**
 * @constructor
 */
function ApcMini() {
    const MIDI_CHANNEL = 0,
        MATRIX_TRACKS = 8,
        MATRIX_SCENES = 8,
        NOTE = {
            MATRIX_START_NOTES_BY_ROW: [56, 48, 40, 32, 24, 16, 8, 0],
            FIRST_SIDE_BUTTON: 82,
            FIRST_BOTTOM_BUTTON: 64,
            SHIFT_BUTTON: 98
        },
        ACTION_NOTE = {
            MATRIX_UP: NOTE.FIRST_BOTTOM_BUTTON,
            MATRIX_DOWN: NOTE.FIRST_BOTTOM_BUTTON + 1,
            MATRIX_LEFT: NOTE.FIRST_BOTTOM_BUTTON + 2,
            MATRIX_RIGHT: NOTE.FIRST_BOTTOM_BUTTON + 3,
            MATRIX_ROTATE: NOTE.FIRST_SIDE_BUTTON + 6
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

    ApcMini.resetButtons();

    var eventDispatcher = lep.MidiEventDispatcher.getInstance(),
        matrixWindow = lep.MatrixWindow.createMain(MATRIX_TRACKS, 0, MATRIX_SCENES),
        isShiftPressed = ko.observable(false).updatedBy(function() {
            eventDispatcher.onNote(NOTE.SHIFT_BUTTON, function(note, value) {
                isShiftPressed(!!value);
                lep.logDev('Shift: {}', !!value);
            });
        }),
        CONTROLSET = {
            MATRIX: matrixWindow.createMatrixControlSet(function(colIndex, rowIndex, absoluteIndex) {
                return new lep.Button({
                    name: lep.util.formatString('MatrixBtn {}:{}', colIndex, rowIndex),
                    clickNote: NOTE.MATRIX_START_NOTES_BY_ROW[rowIndex] + colIndex
                });
            })
        },
        VALUESET = {
        },
        VALUE = {},
        resetAllButtons = function() {
            const colorVelocity = COLOR.OFF;

            NOTE.MATRIX_START_NOTES_BY_ROW.forEach(function (startNote) {
                for (var i=0; i<8; i++) sendNoteOn(MIDI_CHANNEL, startNote+i, colorVelocity);
            });
            for (var i=0; i<8; i++) {
                sendNoteOn(MIDI_CHANNEL, NOTE.FIRST_SIDE_BUTTON+i, colorVelocity);
                sendNoteOn(MIDI_CHANNEL, NOTE.FIRST_BOTTOM_BUTTON+i, colorVelocity);
            }
        };

    function initScrollButtons() {
        new lep.Button({
            name: 'UpBtn',
            clickNote: ACTION_NOTE.MATRIX_UP,
            midiChannel: MIDI_CHANNEL,
            valueToAttach: new lep.KnockoutSyncedValue({
                name: 'MatrixUp',
                ownValue: true,
                refObservable: matrixWindow.canMoveMatrixUp,
                onClick: matrixWindow.moveMatrixUp,
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
                refObservable: matrixWindow.canMoveMatrixDown,
                onClick: matrixWindow.moveMatrixDown,
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
                refObservable: matrixWindow.canMoveMatrixLeft,
                onClick: matrixWindow.moveMatrixLeft,
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
                refObservable: matrixWindow.canMoveMatrixRight,
                onClick: matrixWindow.moveMatrixRight,
                velocityValueOn: COLOR.GREEN,
                velocityValueOff: COLOR.OFF
            })
        });
        new lep.Button({
            name: 'RotateBtn',
            clickNote: ACTION_NOTE.MATRIX_ROTATE,
            midiChannel: MIDI_CHANNEL,
            valueToAttach: new lep.KnockoutSyncedValue({
                name: 'MatrixRotate',
                ownValue: true,
                refObservable: matrixWindow.canRotate,
                onClick: matrixWindow.rotate,
                computedVelocity: ko.computed(function() {
                    return !matrixWindow.canRotate() ? COLOR.OFF :
                            matrixWindow.isOrientationTracksByScenes() ? COLOR.GREEN : COLOR.GREEN_BLINK;
                })
            })
        });
    }

    matrixWindow.prepareLauncherSlotValueSets(function (launcherSlot) {
        return new lep.KnockoutSyncedValue({
            name: lep.util.formatString('{}Value', launcherSlot.name),
            ownValue: true,
            refObservable: launcherSlot.playState,
            onClick: function () {
                launcherSlot.toggle();
            },
            computedVelocity: ko.computed(function () {
                var state = launcherSlot.hasContent() && launcherSlot.playState(),
                    queued = state && state.isQueued;

                return (!state) ? COLOR.OFF :
                       (state.isStop) ? (queued ? COLOR.GREEN_BLINK : COLOR.GREEN)  :
                       (state.isPlay) ? (queued ? COLOR.YELLOW_BLINK : COLOR.YELLOW) :
                       (state.isRecord) ? (queued ? COLOR.RED_BLINK : COLOR.RED) : COLOR.GREEN;
            })
        });
    });

    initScrollButtons();

    ko.computed(function() {
        CONTROLSET.MATRIX.setValueSet( matrixWindow.launcherSlotValueSet() );
    });

    lep.logDev('APC mini ready');
}



/** @static **/
ApcMini.resetButtons = function(leaveExitPattern) {
    const START_NOTES = [56, 48, 40, 32, 24, 16, 8, 0, 82, 64]; // start notes of matrix, side buttons, bottom buttons
    START_NOTES.forEach(function(startNote) {
        for (var i=0; i<8; i++) {
            sendNoteOn(0, startNote+i, 0);
        }
    });
    if (leaveExitPattern) {
        for (var row=0, note; row<8; row++) {
            for (var col=0; col<8; col++) {
                if (col === row || col === (7-row)) {
                    note = START_NOTES[row] + col;
                    sendNoteOn(0, note, 1);
                }
            }
        }
    }
};


/** @override */
function exit() {
    ApcMini.resetButtons(true);
}
