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
    ApcMini.resetButtons();
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
            MATRIX_ROTATE: NOTE.SIDE_BUTTONS_START + 5,
            TRACK_STATES_MODE: NOTE.SIDE_BUTTONS_START + 6,
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
        },
        MATRIX_MODE = {
            LAUNCHERS: 1,
            CONFIG: 2,
            TRACK_STATES: 3
        };

    var eventDispatcher = lep.MidiEventDispatcher.getInstance(),
        transport = lep.util.getTransport(),
        currentMatrixMode = ko.observable(MATRIX_MODE.LAUNCHERS).extend({restoreable: true}),
        matrixWindow = lep.MatrixWindow.createMain(MATRIX_TRACKS, MATRIX_SENDS, MATRIX_SCENES, function (launcherSlot) {
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
        }),
        masterTrack = host.createMasterTrack(0),
        cursorDevice = host.createEditorCursorDevice(0),
        soloExclusivePref = {
            soloExclusive: false
        },
        clearPunchOnStop = ko.observable(true).extend({toggleable: true}),
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
        calcToggledConfigValueVelocity = function(isToggledOn) {
            return isToggledOn ? COLOR.GREEN : COLOR.YELLOW;
        },
        TRANSPORT_VALUE = {
            PLAY: lep.ToggledTransportValue.getPlayInstance(),
            RECORD: lep.ToggledTransportValue.getRecordInstance(),
            ARRANGER_AUTOMATION: lep.ToggledTransportValue.getArrangerAutomationInstance(),
            LOOP: lep.ToggledTransportValue.getLoopInstance(),
            METRONOME: lep.ToggledTransportValue.getMetronomeInstance(calcToggledConfigValueVelocity),
            OVERDUB: lep.ToggledTransportValue.getOverdubInstance(calcToggledConfigValueVelocity),
            PUNCH_IN: lep.ToggledTransportValue.getPunchInInstance(calcToggledConfigValueVelocity),
            PUNCH_OUT: lep.ToggledTransportValue.getPunchOutInstance(calcToggledConfigValueVelocity),
            CLEAR_PUNCH_ON_STOP: new lep.KnockoutSyncedValue({
                name: 'ClearPunchInOutOnStop',
                ownValue: true,
                refObservable: clearPunchOnStop,
                onClick: clearPunchOnStop.toggle,
                computedVelocity: function() {
                    return (!clearPunchOnStop()) ? COLOR.YELLOW : isPlaying() ? COLOR.GREEN_BLINK : COLOR.GREEN;
                }
            })
        },
        CONFIG_VALUES_BY_XY = (function() {
            var xy = lep.util.generateArray(8, function(){
                         return [];
                     });

            xy[7][7] =  new lep.KnockoutSyncedValue({
                name: 'MatrixRestore',
                ownValue: MATRIX_MODE.CONFIG,
                refObservable: ko.observable(),
                onClick: currentMatrixMode.restore,
                velocityValueOn: COLOR.RED_BLINK,
                velocityValueOff: COLOR.RED_BLINK
            });
            xy[0][7] = new lep.KnockoutSyncedValue({
                name: 'CfgTakeover',
                ownValue: true,
                refObservable: lep.StandardRangedValue.globalTakeoverEnabled,
                onClick: lep.StandardRangedValue.globalTakeoverEnabled.toggle,
                velocityValueOn: COLOR.GREEN,
                velocityValueOff: COLOR.YELLOW
            });
            xy[7][4] = TRANSPORT_VALUE.OVERDUB;
            xy[5][5] = TRANSPORT_VALUE.CLEAR_PUNCH_ON_STOP;
            xy[6][5] = TRANSPORT_VALUE.PUNCH_IN;
            xy[7][5] = TRANSPORT_VALUE.PUNCH_OUT;

            return xy;
        })(),
        TRACK_STATE_VALUESETS = (function() {
            lep.ToggledValue.setArmVelocityValues(COLOR.RED_BLINK, COLOR.RED);
            lep.ToggledValue.setMuteVelocityValues(COLOR.YELLOW_BLINK, COLOR.YELLOW);
            lep.ToggledValue.setSoloVelocityValues(COLOR.GREEN_BLINK, COLOR.GREEN);
            return {
                SOLO: lep.ValueSet.createSoloValueSet(matrixWindow.trackBank, MATRIX_TRACKS, soloExclusivePref),
                ARM: lep.ValueSet.createArmValueSet(matrixWindow.trackBank, MATRIX_TRACKS),
                MUTE: lep.ValueSet.createMuteValueSet(matrixWindow.trackBank, MATRIX_TRACKS),
                SELECT: lep.ValueSet.createSelectValueSet(matrixWindow.trackBank, MATRIX_TRACKS)
            };
        })(),
        VALUESET = {
            VOLUME: lep.ValueSet.createVolumeValueSet(matrixWindow.trackBank, 8),
            PAN: lep.ValueSet.createPanValueSet(matrixWindow.trackBank, 8),
            SEND: lep.ValueSet.createSendsValueSet(matrixWindow.trackBank, MATRIX_SENDS, 8),
            DEVICE_PARAMS: new lep.ParamsValueSet(cursorDevice),
            CONFIG: new lep.ValueSet('ConfigValues', 8, 8, function(col, row) {
                if (!row) {
                    return new lep.KnockoutSyncedValue({
                        name: 'CfgTrackScrollSize' + (col + 1),
                        ownValue: (col + 1),
                        refObservable: matrixWindow.tracksScrollSize,
                        velocityValueOn: COLOR.GREEN,
                        velocityValueOff: COLOR.YELLOW
                    });
                }
                return CONFIG_VALUES_BY_XY[col][row] || new lep.BaseValue({
                    name: lep.util.formatString('UnusedConfigSlot{}{}', col, row),
                    value: COLOR.OFF
                });
            }),
            TRACK_STATES: new lep.ValueSet('TrackStates', 8, 8, function(col, row) {
                switch (row) {
                    case 4: return TRACK_STATE_VALUESETS.SOLO.values[col];
                    case 5: return TRACK_STATE_VALUESETS.MUTE.values[col];
                    case 6: return TRACK_STATE_VALUESETS.ARM.values[col];
                    case 7: return TRACK_STATE_VALUESETS.SELECT.values[col];
                }
                return new lep.BaseValue({
                    name: lep.util.formatString('UnusedTrackStateSlot{}{}', col, row),
                    value: COLOR.OFF
                });
            })
        },
        currentFaderValueSet = ko.observable(VALUESET.VOLUME),
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
        isTrackStateModeEnabled = ko.computed({
            read: function() {
                return currentMatrixMode() === MATRIX_MODE.TRACK_STATES;
            },
            write: function(switchOn) {
                if (!switchOn || currentMatrixMode() === MATRIX_MODE.TRACK_STATES) {
                    currentMatrixMode(MATRIX_MODE.LAUNCHERS); // toggle back to launcher-mode
                } else {
                    currentMatrixMode(MATRIX_MODE.TRACK_STATES);
                }
            }
        }).extend({ notify: 'always'}),
        CONTROL = {
            TRACK_STATE_MODE_BTN: new lep.Button({
                name: 'TrackStateModeBtn',
                clickNote: ACTION_NOTE.TRACK_STATES_MODE,
                midiChannel: MIDI_CHANNEL,
                valueToAttach: new lep.KnockoutSyncedValue({
                    name: 'TrackStateMode',
                    ownValue: true,
                    refObservable: isTrackStateModeEnabled,
                    forceRewrite: true,
                    restoreRefAfterLongClick: true,
                    velocityValueOn: COLOR.GREEN,
                    velocityValueOff: COLOR.OFF
                })
            }),
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
                    ignoreClickIf: isShiftPressed,
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
            name: 'MatrixRotateBtn',
            clickNote: ACTION_NOTE.MATRIX_ROTATE,
            midiChannel: MIDI_CHANNEL,
            valueToAttach: new lep.KnockoutSyncedValue({
                name: 'MatrixRotate',
                ownValue: MATRIX_MODE.LAUNCHERS,
                refObservable: currentMatrixMode,
                onClick: function() {
                    if (currentMatrixMode() === MATRIX_MODE.LAUNCHERS) {
                        matrixWindow.rotate();
                    } else {
                        currentMatrixMode(MATRIX_MODE.LAUNCHERS);
                    }
                },
                computedVelocity: function() {
                    return (currentMatrixMode() !== MATRIX_MODE.LAUNCHERS) ? COLOR.OFF :
                            matrixWindow.isOrientationTracksByScenes() ? COLOR.GREEN: COLOR.GREEN_BLINK;
                }
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
                computedVelocity: function() {
                    return isPlaying() ? (isShiftPressed() ? COLOR.GREEN : COLOR.GREEN_BLINK) : COLOR.OFF;
                },
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

    initScrollButtons();
    initTransportButtons();

    eventDispatcher.onNotePressed(ACTION_NOTE.DEVICE, function() {
        if (isShiftPressed()) {
            if (currentMatrixMode() === MATRIX_MODE.CONFIG) {
                currentMatrixMode.restore();
            } else {
                currentMatrixMode(MATRIX_MODE.CONFIG);
            }
        }
    });

    // auto-disable PUNCH IN / PUNCH OUT
    isPlaying.subscribe(function(_isPlaying) {
        if (!_isPlaying && clearPunchOnStop()) {
            transport.isPunchInEnabled().set(false);
            transport.isPunchOutEnabled().set(false);
        }
    });

    lep.StandardRangedValue.globalTakeoverEnabled(true);

    ApcMini.onFirstFlush = function() {
        ApcMini.onFirstFlush = null;

        ko.computed(function() {
            var faderValueSet = currentFaderValueSet(),
                masterValue = (faderValueSet === VALUESET.PAN) ? VALUE.MASTER_PAN : VALUE.MASTER_VOLUME;

            CONTROLSET.FADER_ROW.setValueSet(faderValueSet);
            CONTROL.MASTER_FADER.attachValue(masterValue);
        });

        CONTROLSET.MATRIX.setObservableValueSet(ko.computed(function () {
            var matrixMode = currentMatrixMode();
            return (matrixMode === MATRIX_MODE.CONFIG) ? VALUESET.CONFIG :
                (matrixMode === MATRIX_MODE.TRACK_STATES) ? VALUESET.TRACK_STATES : matrixWindow.launcherSlotValueSet();
        }));

        lep.logDev('ApcMini ready.');
    };

    lep.logDev('Awaiting initial MIDI flush...');
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

/** override */
function flush() {
    if (ApcMini.onFirstFlush) {
        ApcMini.onFirstFlush();
    }
}

/** @override */
function exit() {
    ApcMini.resetButtons(true);
}

