/**
 * Basic Bitwig Controller Script for the Akai APC mini.
 *
 *  - Toggle Matrix orientation (Tracks-Scenes <> Scenes-Tracks)
 *  - [Shift+Clip] => Stop Clip
 *  - [Clip] = Play Clip
 *  - [Stop] = Toggle Play/Stop
 *  - [Shift+Stop] = Return to Arrangement
 *  - [Double-click Shift] = Stop*
 *  - Volume, Pan, Send, Device-Params mode for faders
 *  - Volume/Pan mode on master fader
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
        MATRIX_SENDS = 6,
        MATRIX_TRACKS = 8,
        MATRIX_SCENES = 8,
        NOTE = {
            MATRIX_START_NOTES_BY_ROW: [56, 48, 40, 32, 24, 16, 8, 0],
            SIDE_BUTTONS_START: 82,
            BOTTOM_BUTTONS_START: 64,
            SHIFT_BUTTON: 98
        },
        ACTION_NOTE = {
            MATRIX_UP: NOTE.BOTTOM_BUTTONS_START,
            MATRIX_DOWN: NOTE.BOTTOM_BUTTONS_START + 1,
            MATRIX_LEFT: NOTE.BOTTOM_BUTTONS_START + 2,
            MATRIX_RIGHT: NOTE.BOTTOM_BUTTONS_START + 3,
            MATRIX_ROTATE: NOTE.SIDE_BUTTONS_START + 6,
            STOP_ALL: NOTE.SIDE_BUTTONS_START + 7,
            VOL: NOTE.BOTTOM_BUTTONS_START + 4,
            PAN: NOTE.BOTTOM_BUTTONS_START + 5,
            SEND: NOTE.BOTTOM_BUTTONS_START + 6,
            DEVICE: NOTE.BOTTOM_BUTTONS_START + 7
        },
        CC = {
            FIRST_FADER: 48,
            MASTER_FADER: 48 + 8
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
        transport = lep.util.getTransport(),
        matrixWindow = lep.MatrixWindow.createMain(MATRIX_TRACKS, MATRIX_SENDS, MATRIX_SCENES),
        masterTrack = host.createMasterTrack(0),
        cursorDevice = host.createEditorCursorDevice(0),
        isShiftPressed = ko.observable(false).updatedBy(function() {
            var maxNextDoubleClickTime = 0,
                DOUBLE_CLICK_TIME_IN_MILLIS = 400;

            eventDispatcher.onNote(NOTE.SHIFT_BUTTON, function(note, value) {
                var isPressed = !!value,
                    clickTimeNow;

                if (isPressed) {
                    clickTimeNow = Date.now();
                    if (clickTimeNow < maxNextDoubleClickTime) {
                        transport.stop();
                        return;
                    } else {
                        maxNextDoubleClickTime = clickTimeNow + DOUBLE_CLICK_TIME_IN_MILLIS;
                    }
                }
                isShiftPressed(isPressed);
                //lep.logDev('Shift: {}', isPressed);
            });
        }),
        isPlaying = ko.observable(false).updatedByBitwigValue(transport.isPlaying()),
        VALUESET = {
            VOLUME: lep.ValueSet.createVolumeValueSet(matrixWindow.trackBank, 8),
            PAN: lep.ValueSet.createPanValueSet(matrixWindow.trackBank, 8),
            SEND: lep.ValueSet.createSendsValueSet(matrixWindow.trackBank, MATRIX_SENDS, 8),
            DEVICE_PARAMS: new lep.ParamsValueSet(cursorDevice),
            CONFIG: new lep.ValueSet('ConfigValues', 8, 8, function(row, col) {
                if (!row) {
                    return new lep.KnockoutSyncedValue({
                        name: 'TrackScrollSize' + (col + 1),
                        ownValue: (col + 1),
                        refObservable: matrixWindow.tracksScrollSize,
                        velocityValueOn: COLOR.RED_BLINK,
                        velocityValueOff: COLOR.YELLOW
                    });
                }
                return new lep.BaseValue({
                    name: lep.util.formatString('UnusedConfigSlot{}{}', col, row),
                    value: COLOR.OFF
                });
            })
        },
        VALUE = {
            MASTER_VOLUME: new lep.StandardRangedValue({
                name: 'MasterVol',
                rangedValue: masterTrack.getVolume()
            }),
            MASTER_PAN: new lep.StandardRangedValue({
                name: 'MasterVol',
                rangedValue: masterTrack.getPan()
            })
        },
        currentFaderValueSet = ko.observable(VALUESET.VOLUME),
        CONTROLSET = {
            MATRIX: matrixWindow.createMatrixControlSet(function(colIndex, rowIndex, absoluteIndex) {
                return new lep.Button({
                    name: lep.util.formatString('MatrixBtn {}:{}', colIndex, rowIndex),
                    clickNote: NOTE.MATRIX_START_NOTES_BY_ROW[rowIndex] + colIndex
                });
            }),
            FADER_ROW: new lep.ControlSet('Faders', 8, function(index) {
                return new lep.Fader({
                    name: 'Fader' + index,
                    valueCC: CC.FIRST_FADER + index,
                    midiChannel: MIDI_CHANNEL,
                    isUnidirectional: true
                });
            })
        },
        CONTROL = {
            MASTER_FADER: new lep.Fader({
                name: 'MasterFader',
                valueCC: CC.MASTER_FADER,
                midiChannel: MIDI_CHANNEL,
                isUnidirectional: true
            }),
            VOL_BTN: new lep.Button({
                name: 'VolBtn',
                clickNote: ACTION_NOTE.VOL,
                midiChannel: MIDI_CHANNEL,
                valueToAttach: new lep.KnockoutSyncedValue({
                    name: 'VolMode',
                    ownValue: VALUESET.VOLUME,
                    refObservable: currentFaderValueSet,
                    restoreRefAfterLongClick: true,
                    velocityValueOn: COLOR.RED,
                    velocityValueOff: COLOR.OFF
                })
            }),
            PAN_BTN: new lep.Button({
                name: 'PanBtn',
                clickNote: ACTION_NOTE.PAN,
                midiChannel: MIDI_CHANNEL,
                valueToAttach: new lep.KnockoutSyncedValue({
                    name: 'PanMode',
                    ownValue: VALUESET.PAN,
                    refObservable: currentFaderValueSet,
                    restoreRefAfterLongClick: true,
                    velocityValueOn: COLOR.RED,
                    velocityValueOff: COLOR.OFF
                })
            }),
            SEND_BTN: new lep.Button({
                name: 'SendBtn',
                clickNote: ACTION_NOTE.SEND,
                midiChannel: MIDI_CHANNEL,
                valueToAttach: new lep.KnockoutSyncedValue({
                    name: 'SendMode',
                    ownValue: VALUESET.SEND,
                    refObservable: currentFaderValueSet,
                    restoreRefAfterLongClick: true,
                    velocityValueOn: COLOR.RED,
                    velocityValueOff: COLOR.OFF
                })
            }),
            DEVICE_BTN: new lep.Button({
                name: 'DeviceBtn',
                clickNote: ACTION_NOTE.DEVICE,
                midiChannel: MIDI_CHANNEL,
                valueToAttach: new lep.KnockoutSyncedValue({
                    name: 'DeviceMode',
                    ownValue: VALUESET.DEVICE_PARAMS,
                    refObservable: currentFaderValueSet,
                    restoreRefAfterLongClick: true,
                    velocityValueOn: COLOR.RED,
                    velocityValueOff: COLOR.OFF
                })
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

    function initTransportButtons() {
        new lep.Button({
            name: 'PlayStopBtn',
            clickNote: ACTION_NOTE.STOP_ALL,
            midiChannel: MIDI_CHANNEL,
            valueToAttach: new lep.KnockoutSyncedValue({
                name: 'PlayStop',
                ownValue: true,
                refObservable: ko.computed(function(){
                    return isShiftPressed() || isPlaying();
                }),
                computedVelocity: ko.computed(function() {
                    return isPlaying() ? (isShiftPressed() ? COLOR.GREEN : COLOR.GREEN_BLINK) : COLOR.OFF;
                }),
                onClick: function() {
                    if (isShiftPressed()) {
                        transport.returnToArrangement();
                    } else {
                        transport.togglePlay();
                    }
                }
            })
        });
    }

    matrixWindow.prepareLauncherSlotValueSets(function (launcherSlot) {
        return new lep.KnockoutSyncedValue({
            name: lep.util.formatString('{}Value', launcherSlot.name),
            ownValue: true,
            refObservable: launcherSlot.playState,
            onClick: function () {
                if (isShiftPressed()) {
                    launcherSlot.stop();
                } else {
                    launcherSlot.play();
                }
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
    initTransportButtons();

    ko.computed(function() {
        var matrixValueSet = isShiftPressed() ? VALUESET.CONFIG : matrixWindow.launcherSlotValueSet();
        // TODO find better key to enable config mode (SHIFT+Device?)
        CONTROLSET.MATRIX.setValueSet(matrixValueSet);
    });

    ko.computed(function() {
        var faderValueSet = currentFaderValueSet(),
            masterValue = (faderValueSet === VALUESET.PAN) ? VALUE.MASTER_PAN : VALUE.MASTER_VOLUME;

        CONTROLSET.FADER_ROW.setValueSet(faderValueSet);
        CONTROL.MASTER_FADER.attachValue(masterValue);
    });

    lep.StandardRangedValue.globalTakeoverEnabled(true);

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
