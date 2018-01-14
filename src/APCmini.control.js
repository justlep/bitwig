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
            SHIFT_BUTTON: 98,
            ARROW_UP: 64,
            ARROW_DOWN: 65,
            ARROW_LEFT: 66,
            ARROW_RIGHT: 67
        },
        ACTION_NOTE = {
            MATRIX_UP: NOTE.BOTTOM_BUTTONS_START,
            MATRIX_DOWN: NOTE.BOTTOM_BUTTONS_START + 1,
            MATRIX_LEFT: NOTE.BOTTOM_BUTTONS_START + 2,
            MATRIX_RIGHT: NOTE.BOTTOM_BUTTONS_START + 3,
            MATRIX_MODE: NOTE.SIDE_BUTTONS_START + 5,
            CONFIG_MODE: NOTE.SIDE_BUTTONS_START + 4,
            MIX_MODE: NOTE.SIDE_BUTTONS_START + 6,
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
            LAUNCHERS: {isLaunchers: true},
            CONFIG: {isConfig: true},
            MIX: {isMix: true}
        },
        FADER_MODE = {
            VOLUME: {isVolume: true},
            PAN: {isPan: true},
            SEND: {isSend: true},
            DEVICE: {isDevice: true}
        };

    var eventDispatcher = lep.MidiEventDispatcher.getInstance(),
        transport = lep.util.getTransport(),
        currentMatrixMode = ko.observable(MATRIX_MODE.LAUNCHERS).extend({restoreable: true}),
        currentFaderMode = ko.observable(FADER_MODE.VOLUME).extend({restoreable: true}),
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
        createShiftCurriedHandler = function(fn) {
            return function() {
                fn(isShiftPressed.peek());
            };
        },
        isPlaying = lep.util.getTransportIsPlayingObservable(),
        booleanToColor = {
            yellowGreen: function(isOn) {
                return isOn ? COLOR.GREEN : COLOR.YELLOW;
            },
            yellowRed: function(isOn) {
                return isOn ? COLOR.RED : COLOR.YELLOW;
            }
        },
        VALUE = {
            PLAY: lep.ToggledTransportValue.getPlayInstance(),
            RECORD: lep.ToggledTransportValue.getRecordInstance(),
            ARRANGER_AUTOMATION: lep.ToggledTransportValue.getArrangerAutomationInstance(booleanToColor.yellowRed),
            LOOP: lep.ToggledTransportValue.getLoopInstance(),
            METRONOME: lep.ToggledTransportValue.getMetronomeInstance(booleanToColor.yellowGreen),
            OVERDUB: lep.ToggledTransportValue.getOverdubInstance(booleanToColor.yellowRed),
            PUNCH_IN: lep.ToggledTransportValue.getPunchInInstance(booleanToColor.yellowRed),
            PUNCH_OUT: lep.ToggledTransportValue.getPunchOutInstance(booleanToColor.yellowRed),
            CLEAR_PUNCH_ON_STOP: (function(clearPunchOnStop) {
                isPlaying.subscribe(function(_isPlaying) {
                    if (!_isPlaying && clearPunchOnStop.peek()) {
                        transport.isPunchInEnabled().set(false);
                        transport.isPunchOutEnabled().set(false);
                    }
                });
                return new lep.KnockoutSyncedValue({
                    name: 'ClearPunchInOutOnStop',
                    ownValue: true,
                    refObservable: clearPunchOnStop,
                    onClick: clearPunchOnStop.toggle,
                    computedVelocity: function () {
                        return (!clearPunchOnStop()) ? COLOR.YELLOW : isPlaying() ? COLOR.RED_BLINK : COLOR.RED;
                    }
                });
            })( ko.observable(true).extend({toggleable: true}) ),
            MASTER_VOLUME: new lep.StandardRangedValue({
                name: 'MasterVol',
                rangedValue: masterTrack.getVolume()
            }),
            MASTER_PAN: new lep.StandardRangedValue({
                name: 'MasterVol',
                rangedValue: masterTrack.getPan()
            })
        },
        VALUESET = {
            VOLUME: lep.ValueSet.createVolumeValueSet(matrixWindow.trackBank, 8),
            PAN: lep.ValueSet.createPanValueSet(matrixWindow.trackBank, 8),
            SEND: lep.ValueSet.createSendsValueSet(matrixWindow.trackBank, MATRIX_SENDS, 8),
            DEVICE_PARAMS: new lep.ParamsValueSet(cursorDevice),
            CONFIG: new lep.ValueSet('ConfigValues', 8, 8, function(col, row) {
                if (row === 0) {
                    return new lep.KnockoutSyncedValue({
                        name: 'CfgTrackScrollSize' + (col + 1),
                        ownValue: (col + 1),
                        refObservable: matrixWindow.trackScrollSize,
                        velocityValueOn: COLOR.GREEN,
                        velocityValueOff: COLOR.YELLOW
                    });
                }
                if (row === 1) {
                    return new lep.KnockoutSyncedValue({
                        name: 'CfgSceneScrollSize' + (col + 1),
                        ownValue: (col + 1),
                        refObservable: matrixWindow.sceneScrollSize,
                        velocityValueOn: COLOR.GREEN,
                        velocityValueOff: COLOR.YELLOW
                    });
                }

                const xyDecimal = (col * 10) + row; // e.g. x=7,y=4 -> 74

                switch (xyDecimal) {
                    case 74: return VALUE.OVERDUB;
                    case 55: return VALUE.CLEAR_PUNCH_ON_STOP;
                    case 64: return VALUE.ARRANGER_AUTOMATION;
                    case 65: return VALUE.PUNCH_IN;
                    case 75: return VALUE.PUNCH_OUT;
                    case 77:
                        return new lep.KnockoutSyncedValue({
                            name: 'MatrixRestore',
                            ownValue: MATRIX_MODE.CONFIG,
                            refObservable: ko.observable(),
                            onClick: currentMatrixMode.restore,
                            velocityValueOn: COLOR.RED_BLINK,
                            velocityValueOff: COLOR.RED_BLINK
                        });
                    case 7:
                        return new lep.KnockoutSyncedValue({
                            name: 'CfgTakeover',
                            ownValue: true,
                            refObservable: lep.StandardRangedValue.globalTakeoverEnabled,
                            onClick: lep.StandardRangedValue.globalTakeoverEnabled.toggle,
                            velocityValueOn: COLOR.GREEN,
                            velocityValueOff: COLOR.YELLOW
                        });
                }
                return new lep.BaseValue({
                    name: lep.util.formatString('UnusedConfigSlot{}{}', col, row),
                    value: COLOR.OFF
                });
            }),
            MIX: new lep.ValueSet('MixValues', 8, 8, function(col, row) {
                if (!row && !col) {
                    // init default colors once only
                    lep.ToggledValue.setArmVelocityValues(COLOR.RED_BLINK, COLOR.RED);
                    lep.ToggledValue.setMuteVelocityValues(COLOR.YELLOW_BLINK, COLOR.YELLOW);
                    lep.ToggledValue.setSoloVelocityValues(COLOR.GREEN_BLINK, COLOR.GREEN);
                    lep.ChannelSelectValue.setVelocityValues(COLOR.GREEN, COLOR.OFF);
                }
                switch(row) {
                    case 4: return lep.ToggledValue.createArmValue(matrixWindow.trackBank, col);
                    case 5: return lep.ToggledValue.createSoloValue(matrixWindow.trackBank, col, soloExclusivePref);
                    case 6: return lep.ToggledValue.createMuteValue(matrixWindow.trackBank, col);
                    case 7: return lep.ChannelSelectValue.create(matrixWindow.trackBank, col);
                }
                return new lep.BaseValue({
                    name: lep.util.formatString('UnusedMixSlot{}{}', col, row),
                    value: COLOR.OFF
                });
            })
        },
        CONTROLSET = {
            MATRIX: matrixWindow.createMatrixControlSet(function(colIndex, rowIndex /*, absoluteIndex */) {
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
        };

    function initButtons() {
        new lep.Button({
            name: 'ConfigModeBtn',
            clickNote: ACTION_NOTE.CONFIG_MODE,
            midiChannel: MIDI_CHANNEL,
            valueToAttach: new lep.KnockoutSyncedValue({
                name: 'ConfigMode',
                ownValue: MATRIX_MODE.CONFIG,
                refObservable: currentMatrixMode,
                restoreRefAfterLongClick: true,
                velocityValueOn: COLOR.GREEN,
                velocityValueOff: COLOR.OFF
            })
        });
        new lep.Button({
            name: 'MixModeBtn',
            clickNote: ACTION_NOTE.MIX_MODE,
            midiChannel: MIDI_CHANNEL,
            valueToAttach: new lep.KnockoutSyncedValue({
                name: 'MixMode',
                ownValue: MATRIX_MODE.MIX,
                refObservable: currentMatrixMode,
                restoreRefAfterLongClick: true,
                velocityValueOn: COLOR.GREEN,
                velocityValueOff: COLOR.OFF
            })
        });
        new lep.Button({
            name: 'MatrixLauncherModeBtn',
            clickNote: ACTION_NOTE.MATRIX_MODE,
            midiChannel: MIDI_CHANNEL,
            valueToAttach: new lep.KnockoutSyncedValue({
                name: 'MatrixLauncherMode',
                ownValue: MATRIX_MODE.LAUNCHERS,
                refObservable: currentMatrixMode,
                restoreRefAfterLongClick: true,
                isOnClickRestoreable: true,
                onClick: function() {
                    if (currentMatrixMode().isLaunchers) {
                        matrixWindow.rotate();
                    } else {
                        currentMatrixMode(MATRIX_MODE.LAUNCHERS);
                    }
                },
                computedVelocity: function() {
                    return (!currentMatrixMode().isLaunchers) ? COLOR.OFF :
                             matrixWindow.isOrientationTracksByScenes() ? COLOR.GREEN: COLOR.GREEN_BLINK;
                }
            })
        });
        new lep.Button({
            name: 'VolBtn',
            clickNote: ACTION_NOTE.VOL,
            midiChannel: MIDI_CHANNEL,
            valueToAttach: new lep.KnockoutSyncedValue({
                name: 'VolMode',
                ownValue: FADER_MODE.VOLUME,
                refObservable: currentFaderMode,
                restoreRefAfterLongClick: true,
                velocityValueOn: COLOR.RED,
                velocityValueOff: COLOR.OFF
            })
        });
        new lep.Button({
            name: 'PanBtn',
            clickNote: ACTION_NOTE.PAN,
            midiChannel: MIDI_CHANNEL,
            valueToAttach: new lep.KnockoutSyncedValue({
                name: 'PanMode',
                ownValue: FADER_MODE.PAN,
                refObservable: currentFaderMode,
                restoreRefAfterLongClick: true,
                velocityValueOn: COLOR.RED,
                velocityValueOff: COLOR.OFF
            })
        });
        new lep.Button({
            name: 'SendBtn',
            clickNote: ACTION_NOTE.SEND,
            midiChannel: MIDI_CHANNEL,
            valueToAttach: new lep.KnockoutSyncedValue({
                name: 'SendMode',
                ownValue: FADER_MODE.SEND,
                refObservable: currentFaderMode,
                restoreRefAfterLongClick: true,
                velocityValueOn: COLOR.RED,
                velocityValueOff: COLOR.OFF
            })
        });
        new lep.Button({
            name: 'DeviceBtn',
            clickNote: ACTION_NOTE.DEVICE,
            midiChannel: MIDI_CHANNEL,
            valueToAttach: new lep.KnockoutSyncedValue({
                name: 'DeviceMode',
                ownValue: FADER_MODE.DEVICE,
                refObservable: currentFaderMode,
                restoreRefAfterLongClick: true,
                velocityValueOn: COLOR.RED,
                velocityValueOff: COLOR.OFF
            })
        });

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

    function initScrollButtons() {
        var MATRIX_LEFT_VALUE = new lep.KnockoutSyncedValue({
                name: 'MatrixLeft',
                ownValue: true,
                refObservable: matrixWindow.canMoveMatrixLeft,
                onClick: createShiftCurriedHandler(matrixWindow.moveMatrixLeft),
                velocityValueOn: COLOR.RED,
                velocityValueOff: COLOR.OFF
            }),
            MATRIX_RIGHT_VALUE =  new lep.KnockoutSyncedValue({
                name: 'MatrixRight',
                ownValue: true,
                refObservable: matrixWindow.canMoveMatrixRight,
                onClick: createShiftCurriedHandler(matrixWindow.moveMatrixRight),
                velocityValueOn: COLOR.RED,
                velocityValueOff: COLOR.OFF
            }),
            MATRIX_UP_VALUE = new lep.KnockoutSyncedValue({
                name: 'MatrixUp',
                ownValue: true,
                refObservable: matrixWindow.canMoveMatrixUp,
                onClick: createShiftCurriedHandler(matrixWindow.moveMatrixUp),
                velocityValueOn: COLOR.RED,
                velocityValueOff: COLOR.OFF
            }),
            MATRIX_DOWN_VALUE = new lep.KnockoutSyncedValue({
                name: 'MatrixDown',
                ownValue: true,
                refObservable: matrixWindow.canMoveMatrixDown,
                onClick: createShiftCurriedHandler(matrixWindow.moveMatrixDown),
                velocityValueOn: COLOR.RED,
                velocityValueOff: COLOR.OFF
            }),
            TRACKS_LEFT_VALUE =  new lep.KnockoutSyncedValue({
                name: 'TracksLeft',
                ownValue: true,
                refObservable: matrixWindow.canMoveChannelBack,
                onClick: function() {
                    void( isShiftPressed() ? matrixWindow.moveChannelPageBack() : matrixWindow.moveChannelBack() );
                },
                velocityValueOn: COLOR.RED,
                velocityValueOff: COLOR.OFF
            }),
            TRACKS_RIGHT_VALUE =  new lep.KnockoutSyncedValue({
                name: 'TracksRight',
                ownValue: true,
                refObservable: matrixWindow.canMoveChannelForth,
                onClick: function() {
                    void( isShiftPressed() ? matrixWindow.moveChannelPageForth() : matrixWindow.moveChannelForth() );
                },
                velocityValueOn: COLOR.RED,
                velocityValueOff: COLOR.OFF
            }),
            PREV_VALUEPAGE_FOR_FADERS = new lep.KnockoutSyncedValue({
                name: 'FadersPrevValuePageBtn',
                ownValue: true,
                refObservable: CONTROLSET.FADER_ROW.hasPrevValuePage,
                onClick: CONTROLSET.FADER_ROW.prevValuePage
            }),
            NEXT_VALUEPAGE_FOR_FADERS = new lep.KnockoutSyncedValue({
                name: 'FadersNextValuePageBtn',
                ownValue: true,
                refObservable: CONTROLSET.FADER_ROW.hasNextValuePage,
                onClick: CONTROLSET.FADER_ROW.nextValuePage
            }),
            currentModeForArrows = ko.computed(function() {
                var currentMode = currentMatrixMode(),
                    modeBeforeConfig = currentMode.isConfig && currentMatrixMode.previousValue;

                return (modeBeforeConfig && !modeBeforeConfig.isConfig) ? modeBeforeConfig : currentMode;
            });

        new lep.Button({
            name: 'UpBtn',
            clickNote: NOTE.ARROW_UP,
            midiChannel: MIDI_CHANNEL,
            valueToAttach: ko.computed(function() {
                return currentModeForArrows().isMix ? PREV_VALUEPAGE_FOR_FADERS : MATRIX_UP_VALUE;
            })
        });
        new lep.Button({
            name: 'DownBtn',
            clickNote: NOTE.ARROW_DOWN,
            midiChannel: MIDI_CHANNEL,
            valueToAttach: ko.computed(function() {
                return currentModeForArrows().isMix ? NEXT_VALUEPAGE_FOR_FADERS : MATRIX_DOWN_VALUE;
            })
        });
        new lep.Button({
            name: 'LeftBtn',
            clickNote: NOTE.ARROW_LEFT,
            midiChannel: MIDI_CHANNEL,
            valueToAttach: ko.computed(function() {
                return currentModeForArrows().isMix ? TRACKS_LEFT_VALUE : MATRIX_LEFT_VALUE;
            })
        });
        new lep.Button({
            name: 'RightBtn',
            clickNote: NOTE.ARROW_RIGHT,
            midiChannel: MIDI_CHANNEL,
            valueToAttach: ko.computed(function() {
                return currentModeForArrows().isMix ? TRACKS_RIGHT_VALUE : MATRIX_RIGHT_VALUE;
            })
        });
    }

    function initFaders() {
        FADER_MODE.VOLUME.valueSet = VALUESET.VOLUME;
        FADER_MODE.PAN.valueSet = VALUESET.PAN;
        FADER_MODE.SEND.valueSet = VALUESET.SEND;
        FADER_MODE.DEVICE.valueSet = VALUESET.DEVICE_PARAMS;

        CONTROLSET.FADER_ROW.setObservableValueSet(ko.computed(function() {
            return currentFaderMode().valueSet;
        }));

        new lep.Fader({
            name: 'MasterFader',
            valueCC: CC.MASTER_FADER,
            midiChannel: MIDI_CHANNEL,
            isUnidirectional: true,
            valueToAttach: ko.computed(function() {
                return currentFaderMode().isPan ? VALUE.MASTER_PAN : VALUE.MASTER_VOLUME;
            })
        });
    }

    function initMatrix() {
        CONTROLSET.MATRIX.setObservableValueSet(ko.computed(function () {
            var matrixMode = currentMatrixMode();
            return (matrixMode.isConfig) ? VALUESET.CONFIG :
                   (matrixMode.isMix) ? VALUESET.MIX :
                    matrixWindow.launcherSlotValueSet();
        }));
    }

    lep.StandardRangedValue.globalTakeoverEnabled(true);

    ApcMini.onFirstFlush = function() {
        ApcMini.onFirstFlush = null;

        initButtons();
        initScrollButtons();
        initFaders();
        initMatrix();

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

/** @override */
function flush() {
    if (ApcMini.onFirstFlush) {
        ApcMini.onFirstFlush();
    }
}

/** @override */
function exit() {
    ApcMini.resetButtons(true);
}

