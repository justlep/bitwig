/**
 * Bitwig Controller Script for the Behringer X-Touch Mini.
 *
 * Author: Lennart Pegel - https://github.com/justlep/bitwig
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 */

loadAPI(6);
load('lep-framework/complete.js');

host.defineController('Behringer', 'X-Touch Mini', '1.0', '78370722-cd92-11e8-a8d5-f2801f1b9fd1', 'Lennart Pegel');
host.defineMidiPorts(1, 1);
host.addDeviceNameBasedDiscoveryPair(['X-TOUCH MINI'], ['X-TOUCH MINI']);

function init() {
    lep.setLogLevel(lep.LOGLEVEL.DEV);
    new lep.XTouchMini();
}

/**
 * @constructor
 */
lep.XTouchMini = function() {
    host.getNotificationSettings().getUserNotificationsEnabled().set(true);

    var MIDI_CHANNEL = 10,
        GLOBAL_MIDI_CHANNEL = 0,
        WINDOW_SIZE = 8,
        USER_CONTROL_PAGES = 6,
        prefs = {
            soloExclusive: true
        },
        CC = {
            FIRST_ENCODER: 1,
            FIRST_ENCODER_LED_MODE_GLOBAL: 1,
            MAIN_FADER_MOVE: 9
        },
        PARAMS_MODE_BTN_OFFSET_IN_FIRST_ROW = 4,
        NOTE = {
            GLOBAL_BTN_OFFSET: -8,
            FIRST_ENCODER_CLICK: 0,
            FIRST_TOP_BTN: 8,
            FIRST_BOTTOM_BTN: 16,
            FIRST_TOP_BTN_GLOBAL: 0,
            FIRST_BOTTOM_BTN_GLOBAL: 8,
            get PARAMS_MODE_BTN() {return this.FIRST_TOP_BTN + PARAMS_MODE_BTN_OFFSET_IN_FIRST_ROW;},
            get BTN_LOOP()           {return this.FIRST_BOTTOM_BTN + 4;},
            get BTN_LOOP_GLOBAL()    {return this.FIRST_BOTTOM_BTN + 4 + this.GLOBAL_BTN_OFFSET;},
            get BTN_RECORD()         {return this.FIRST_BOTTOM_BTN +  7;},
            get BTN_RECORD_GLOBAL()  {return this.FIRST_BOTTOM_BTN +  7 + this.GLOBAL_BTN_OFFSET;},
            get BTN_REWIND()         {return this.FIRST_BOTTOM_BTN +  2;},
            get BTN_REWIND_GLOBAL()  {return this.FIRST_BOTTOM_BTN +  2 + this.GLOBAL_BTN_OFFSET;},
            get BTN_FORWARD()        {return this.FIRST_BOTTOM_BTN +  3;},
            get BTN_FORWARD_GLOBAL() {return this.FIRST_BOTTOM_BTN +  3 + this.GLOBAL_BTN_OFFSET;},
            get BTN_STOP()           {return this.FIRST_BOTTOM_BTN +  5;},
            get BTN_STOP_GLOBAL()    {return this.FIRST_BOTTOM_BTN +  5 + this.GLOBAL_BTN_OFFSET;},
            get BTN_PLAY()           {return this.FIRST_BOTTOM_BTN +  6;},
            get BTN_PLAY_GLOBAL()    {return this.FIRST_BOTTOM_BTN +  6 + this.GLOBAL_BTN_OFFSET;}
        },
        NOTE_ACTION = {
            SHIFT: NOTE.FIRST_BOTTOM_BTN,
            TOP_BUTTONS_MODE: NOTE.FIRST_BOTTOM_BTN + 1,
            TOP_BUTTONS_MODE_GLOBAL: NOTE.FIRST_BOTTOM_BTN_GLOBAL + 1,
            PREV_DEVICE_OR_CHANNEL_PAGE: NOTE.BTN_REWIND,
            NEXT_DEVICE_OR_CHANNEL_PAGE: NOTE.BTN_FORWARD
        },
        BUTTON_VALUE = {
            OFF: 0,
            ON: 1,
            BLINK: 2
        },
        ENCODER_LED_MODE = {
            SINGLE: 0,
            PAN: 1,
            FAN: 2,
            SPREAD: 3,
            TRIM: 4
        },
        XT_BUTTON_MODE = {
            VALUETYPE: {isValueType: 1, valueSet: null},
            VALUE_PAGE: {isValuePage: 1, valueSet: null}, // TODO find useful button combination to activate, or drop feature
            SELECT: {isSelect: 1, valueSet: null},
            ARM: {isArm: 1, valueSet: null} // TODO
        },
        buttonMode = ko.observable(XT_BUTTON_MODE.VALUETYPE);

    lep.ToggledValue.setAllDefaultVelocityValues(BUTTON_VALUE.ON, BUTTON_VALUE.OFF);
    lep.ChannelSelectValue.setVelocityValues(BUTTON_VALUE.ON, BUTTON_VALUE.OFF);
    lep.ToggledValue.setArmVelocityValues(BUTTON_VALUE.BLINK, BUTTON_VALUE.OFF);

    var transport = lep.util.getTransport(),
        trackBank = host.createMainTrackBank(WINDOW_SIZE, 1, 0),
        eventDispatcher = lep.MidiEventDispatcher.getInstance(),
        flushDispatcher = lep.MidiFlushDispatcher.getInstance(),
        tracksView = new lep.TracksView('Tracks', 8, 0, 0, trackBank),
        isShiftPressed = eventDispatcher.createNotePressedObservable(NOTE_ACTION.SHIFT, MIDI_CHANNEL),
        isLoopPressed = eventDispatcher.createNotePressedObservable(NOTE.BTN_LOOP, MIDI_CHANNEL),
        // isStopPressed = eventDispatcher.createNotePressedObservable(NOTE.BTN_STOP, MIDI_CHANNEL),
        // isPlayPressed = eventDispatcher.createNotePressedObservable(NOTE.BTN_PLAY, MIDI_CHANNEL),
        // isRecordPressed =  eventDispatcher.createNotePressedObservable(NOTE.BTN_RECORD, MIDI_CHANNEL),
        isParamsModeBtnPressed = eventDispatcher.createNotePressedObservable(NOTE.PARAMS_MODE_BTN, MIDI_CHANNEL),
        clearPunchOnStop = ko.toggleableObservable(false), // TODO currently unused; find proper button combination or drop feature

        HANDLERS = {
            NEXT_DEVICE_OR_CHANNEL_PAGE: function() {
                if (isParamsModeBtnPressed()) {
                    VALUESET.PARAM.selectNextDevice();
                } else {
                    tracksView.moveChannelPageForth();
                }
            },
            PREV_DEVICE_OR_CHANNEL_PAGE: function() {
                if (isParamsModeBtnPressed()) {
                    VALUESET.PARAM.selectPreviousDevice();
                } else {
                    tracksView.moveChannelPageBack();
                }
            },
            PLAYING_STATUS_CHANGED: function(isPlaying) {
                if (!isPlaying && clearPunchOnStop()) {
                    if (TRANSPORT_VALUE.PUNCH_IN.value) {
                        transport.isPunchInEnabled().toggle();
                    }
                    if (TRANSPORT_VALUE.PUNCH_OUT.value) {
                        transport.isPunchOutEnabled().toggle();
                    }
                }
            }
        },

        CONTROLSET = {
            ENCODERS: new lep.ControlSet('TopEncoders', WINDOW_SIZE, function(index) {
                return new lep.ClickEncoder({
                    name: 'TopEncoder' + index,
                    valueCC: CC.FIRST_ENCODER + index,
                    clickNote: NOTE.FIRST_ENCODER_CLICK + index,
                    midiChannel: MIDI_CHANNEL
                });
            }).withAutoSwap(),
            TOP_BUTTONS: new lep.ControlSet('TopButtons', WINDOW_SIZE, function(index) {
                return new lep.Button({
                    name: 'TopBtn' + index,
                    clickNote: NOTE.FIRST_TOP_BTN + index,
                    midiChannel: MIDI_CHANNEL,
                    midiChannel4Sync: GLOBAL_MIDI_CHANNEL,
                    clickNote4Sync: NOTE.FIRST_TOP_BTN_GLOBAL + index
                });
            }),
            BOTTOM_BUTTONS: new lep.ControlSet('BottomButtons', WINDOW_SIZE, function(index) {
                return new lep.Button({
                    name: 'BottomBtn' + index,
                    clickNote: NOTE.FIRST_BOTTOM_BTN + index,
                    midiChannel: MIDI_CHANNEL,
                    midiChannel4Sync: GLOBAL_MIDI_CHANNEL,
                    clickNote4Sync: NOTE.FIRST_BOTTOM_BTN_GLOBAL + index
                });
            })
        },

        TRANSPORT_VALUE = {
            PLAY: lep.ToggledTransportValue.getPlayInstance().withVelocities(BUTTON_VALUE.BLINK, BUTTON_VALUE.OFF),
            RECORD: lep.ToggledTransportValue.getRecordInstance().withVelocities(BUTTON_VALUE.ON, BUTTON_VALUE.OFF),
            ARRANGER_AUTOMATION: lep.ToggledTransportValue.getArrangerAutomationInstance().withVelocities(BUTTON_VALUE.ON, BUTTON_VALUE.OFF),
            LOOP: lep.ToggledTransportValue.getLoopInstance().withVelocities(BUTTON_VALUE.ON, BUTTON_VALUE.OFF),
            METRONOME: lep.ToggledTransportValue.getMetronomeInstance().withVelocities(BUTTON_VALUE.BLINK, BUTTON_VALUE.OFF),
            OVERDUB: lep.ToggledTransportValue.getOverdubInstance().withVelocities(BUTTON_VALUE.ON, BUTTON_VALUE.OFF),
            PUNCH_IN: lep.ToggledTransportValue.getPunchInInstance().withVelocities(BUTTON_VALUE.ON, BUTTON_VALUE.OFF),
            PUNCH_OUT: lep.ToggledTransportValue.getPunchOutInstance().withVelocities(BUTTON_VALUE.ON, BUTTON_VALUE.OFF),
            CLEAR_PUNCH_ON_STOP: new lep.KnockoutSyncedValue({
                name: 'ClearPunchInOutOnStop',
                ownValue: true,
                refObservable: clearPunchOnStop,
                velocityValueOn: BUTTON_VALUE.ON,
                onClick: clearPunchOnStop.toggle
            }),
            STOP: new lep.KnockoutSyncedValue({
                name: 'Stop',
                ownValue: true,
                refObservable: ko.observable(),
                computedVelocity: function() {
                    return BUTTON_VALUE.OFF;
                },
                onClick: function() {
                    // TODO find some useful functionality for shift+stop
                    transport.stop();
                }
            })
        },

        VALUESET = {
            VOLUME: lep.ValueSet.createVolumeValueSet(trackBank, WINDOW_SIZE),
            PAN:    lep.ValueSet.createPanValueSet(trackBank, WINDOW_SIZE),
            SEND:   lep.SendsValueSet.createFromTrackBank(trackBank),
            SELECTED_TRACK_SENDS: new lep.SelectedTrackSendsValueSet(WINDOW_SIZE),
            PARAM:  new lep.ParamsValueSet(),
            USERCONTROL: lep.ValueSet.createUserControlsValueSet(USER_CONTROL_PAGES, WINDOW_SIZE, 'XTC-UC-{}-{}'),
            SOLO:   lep.ValueSet.createSoloValueSet(trackBank, WINDOW_SIZE, prefs),
            ARM:    lep.ValueSet.createArmValueSet(trackBank, WINDOW_SIZE),
            MUTE:   lep.ValueSet.createMuteValueSet(trackBank, WINDOW_SIZE),
            SELECT: lep.ValueSet.createSelectValueSet(trackBank, WINDOW_SIZE)
        },
        /**
         * The valuesets as they are distributed over the top-row buttons for selecting what's currently controlled by the rotary encoders.
         */
        SWITCHABLE_VALUESETS = [
            VALUESET.VOLUME,
            VALUESET.PAN,
            VALUESET.SEND,
            VALUESET.SELECTED_TRACK_SENDS,
            VALUESET.PARAM,
            VALUESET.USERCONTROL
        ],
        VALUE = {
            MASTER_VOLUME: lep.StandardRangedValue.createMasterVolumeValue(true),
            METRONOME_VOLUME: lep.StandardRangedValue.createMetronomeVolumeValue(true)
        },

        /**
         * ValueSet for the buttons selecting which value type (volume, pan etc) is assigned to the encoders/faders.
         * (!) The last two buttons do NOT represent value *type* but the -/+ buttons for the active value *PAGE*
         */
        VALUETYPE_SELECTOR_VALUESET = (function() {
            var namePrefix = 'TopEncoders',
                targetControlSet = CONTROLSET.ENCODERS;

            lep.util.assert(SWITCHABLE_VALUESETS.length);
            lep.util.assert(targetControlSet instanceof lep.ControlSet,
                'Invalid targetControlSet for createValueTypeSelectorValueSet(): {}', targetControlSet);

            return new lep.ValueSet(namePrefix + 'ValueTypeSelector', WINDOW_SIZE, 1, function(index) {
                var isPrevPageIndex = (index === WINDOW_SIZE-2),
                    isNextPageBtn = (index === WINDOW_SIZE-1),
                    switchableValueSet = !isPrevPageIndex && !isNextPageBtn && SWITCHABLE_VALUESETS[index],
                    isParamsValueSet = switchableValueSet === VALUESET.PARAM,
                    isUserControlValueSet = switchableValueSet === VALUESET.USERCONTROL,
                    isTrackSends = switchableValueSet === VALUESET.SELECTED_TRACK_SENDS,
                    isLockableValueSet = isParamsValueSet || isTrackSends;

                if (isPrevPageIndex) {
                    return new lep.KnockoutSyncedValue({
                        name: namePrefix + 'PrevValuePage',
                        ownValue: true,
                        refObservable: targetControlSet.hasPrevValuePage,
                        onClick: function() {
                            if (isParamsModeBtnPressed.peek()) {
                                VALUESET.PARAM.lockedToPage.toggle();
                            } else {
                                targetControlSet.prevValuePage();
                            }
                        },
                        computedVelocity: function() {
                            var canSwitchPage = this.refObservable(),
                                isSwitchableLockedParamsPage = canSwitchPage &&
                                    (targetControlSet.valueSet() === VALUESET.PARAM) &&
                                    VALUESET.PARAM.lockedToPage();
                            return canSwitchPage ? (isSwitchableLockedParamsPage ? BUTTON_VALUE.BLINK : BUTTON_VALUE.ON) : BUTTON_VALUE.OFF;
                        }
                    });
                }
                if (isNextPageBtn) {
                    return new lep.KnockoutSyncedValue({
                        name: namePrefix + 'NextValuePage',
                        ownValue: true,
                        refObservable: targetControlSet.hasNextValuePage,
                        onClick: function() {
                            if (isParamsModeBtnPressed.peek()) {
                                VALUESET.PARAM.gotoDevice();
                                VALUESET.PARAM.toggleRemoteControlsSection();
                            } else {
                                targetControlSet.nextValuePage();
                            }
                        },
                        computedVelocity: function() {
                            var canSwitchPage = this.refObservable(),
                                isSwitchableLockedParamsPage = canSwitchPage && (targetControlSet.valueSet() === VALUESET.PARAM) &&
                                    VALUESET.PARAM.lockedToPage();
                            return canSwitchPage ? (isSwitchableLockedParamsPage ? BUTTON_VALUE.BLINK : BUTTON_VALUE.ON) : BUTTON_VALUE.OFF;
                        }
                    });
                }
                if (switchableValueSet) {
                    return new lep.KnockoutSyncedValue({
                        name: namePrefix + 'ValueTypeSelect-' + switchableValueSet.name,
                        ownValue: switchableValueSet,
                        refObservable: targetControlSet.valueSet,
                        velocityValueOn: isLockableValueSet ? undefined : BUTTON_VALUE.ON,
                        computedVelocity: isLockableValueSet ? function() {
                            if (this.ownValue !== this.refObservable()) {
                                return BUTTON_VALUE.OFF;
                            }
                            var isLocked = isParamsValueSet ? switchableValueSet.lockedToDevice() :
                                isTrackSends ? switchableValueSet.lockedToTrack() : false;
                            return isLocked ? BUTTON_VALUE.BLINK : BUTTON_VALUE.ON;
                        } : undefined,
                        doubleClickAware: isLockableValueSet,
                        onClick: function(valueSet, refObs, isDoubleClick) {
                            if (isUserControlValueSet && isParamsModeBtnPressed.peek()) {
                                VALUESET.PARAM.toggleDeviceWindow();
                            } else if (isDoubleClick) {
                                if (isTrackSends) {
                                    valueSet.lockedToTrack.toggle();
                                } else if (isParamsValueSet) {
                                    valueSet.lockedToDevice.toggle();
                                }
                            } else if (valueSet !== refObs()) {
                                refObs(valueSet);
                            }
                        }
                    });
                }
            });
        })();

    function initPreferences() {
        var preferences = host.getPreferences(),
            soloExclusiveValue = preferences.getEnumSetting('SOLO Exlusive', 'Preferences', ['ON','OFF'], 'OFF');

        soloExclusiveValue.addValueObserver(function(newValue) {
            prefs.soloExclusive = (newValue === 'ON');
            lep.logDebug('Toggled SOLO EXCLUSIVE {}', prefs.soloExclusive);
        });
    }

    function initMainFader() {
        new lep.Fader({
            name: 'MainFader',
            isUnidirectional: true,
            valueCC: CC.MAIN_FADER_MOVE,
            midiChannel: MIDI_CHANNEL,
            valueToAttach: ko.computed(function() {
                return (isLoopPressed() && isShiftPressed()) ? VALUE.METRONOME_VOLUME : VALUE.MASTER_VOLUME;
            })
        });
    }

    function initTransportButtons() {
        var CYCLED_BUTTON_MODES = [
                XT_BUTTON_MODE.VALUETYPE,
                XT_BUTTON_MODE.SELECT,
                XT_BUTTON_MODE.ARM
            ],
            CYCLED_BUTTON_VALUE = [BUTTON_VALUE.OFF, BUTTON_VALUE.ON, BUTTON_VALUE.BLINK];

        new lep.Button({
            name: 'TopButtonsModeToggleBtn',
            clickNote: NOTE_ACTION.TOP_BUTTONS_MODE,
            clickNote4Sync: NOTE_ACTION.TOP_BUTTONS_MODE_GLOBAL,
            midiChannel: MIDI_CHANNEL,
            midiChannel4Sync: GLOBAL_MIDI_CHANNEL,
            valueToAttach: new lep.KnockoutSyncedValue({
                name: 'TopButtonModeSwitch',
                ownValue: XT_BUTTON_MODE.VALUETYPE,
                refObservable: buttonMode,
                computedVelocity: function() {
                    var indexInCycle = CYCLED_BUTTON_MODES.indexOf(buttonMode());
                    return (indexInCycle >= 0) ? CYCLED_BUTTON_VALUE[indexInCycle] : BUTTON_VALUE.BLINK;
                },
                onClick: function(ownValue, refObs) {
                    // cycle between VALUETYPE <> SELECT <> ARM
                    var indexInCycle = CYCLED_BUTTON_MODES.indexOf(buttonMode()),
                        nextIndex = (indexInCycle + 1) % CYCLED_BUTTON_MODES.length,
                        newButtonMode = CYCLED_BUTTON_MODES[nextIndex];

                    refObs(newButtonMode);
                }
            })
        });
        new lep.Button({
            name: 'PlayBtn',
            clickNote: NOTE.BTN_PLAY,
            clickNote4Sync: NOTE.BTN_PLAY_GLOBAL,
            midiChannel: MIDI_CHANNEL,
            midiChannel4Sync: GLOBAL_MIDI_CHANNEL,
            valueToAttach: ko.computed(function() {
                return isShiftPressed() ? TRANSPORT_VALUE.OVERDUB : TRANSPORT_VALUE.PLAY;
            })
        });
        new lep.Button({
            name: 'RecordBtn',
            clickNote: NOTE.BTN_RECORD,
            clickNote4Sync: NOTE.BTN_RECORD_GLOBAL,
            midiChannel: MIDI_CHANNEL,
            midiChannel4Sync: GLOBAL_MIDI_CHANNEL,
            valueToAttach: ko.computed(function() {
                return isShiftPressed() ? TRANSPORT_VALUE.ARRANGER_AUTOMATION : TRANSPORT_VALUE.RECORD;
            })
        });

        new lep.Button({
            name: 'LoopBtn',
            clickNote: NOTE.BTN_LOOP,
            midiChannel: MIDI_CHANNEL,
            midiChannel4Sync: GLOBAL_MIDI_CHANNEL,
            clickNote4Sync: NOTE.BTN_LOOP_GLOBAL,
            valueToAttach: ko.computed(function() {
                return isShiftPressed() ? TRANSPORT_VALUE.METRONOME : TRANSPORT_VALUE.LOOP;
            })
        });

        new lep.Button({
            name: 'StopBtn',
            clickNote: NOTE.BTN_STOP,
            midiChannel: MIDI_CHANNEL,
            valueToAttach: ko.computed(function() {
                // any other useful value?
                return isShiftPressed() ? TRANSPORT_VALUE.STOP : TRANSPORT_VALUE.STOP;
            })
        });
    }

    /**
     * Switch the LED ring display mode of the encoders depending on the value type it is currently attached to
     */
    function initEncoderLedRingsModeSwitching() {
        var currentLedMode;

        /**
         * @param {lep.ValueSet} newValueSet - the new ValueSet that just got attached to this ControlSet (this)
         * @this {lep.ControlSet}
         */
        var onEncodersValueSetChanged = function(newValueSet) {
            var newLedMode = (!newValueSet) ? currentLedMode : (newValueSet === VALUESET.PAN) ? ENCODER_LED_MODE.TRIM : ENCODER_LED_MODE.FAN;

            if (newLedMode !== currentLedMode) {
                lep.logDebug('Setting LED mode of {} to {}', this.name, newLedMode);
                for (var i = this.controls.length-1, cc; i >= 0; i--) {
                    // encoder led mode global CCs equal the encoder CCs
                    cc = this.controls[i].valueCC4Sync;
                    sendChannelController(GLOBAL_MIDI_CHANNEL, cc, newLedMode);
                }
                currentLedMode = newLedMode;
            }
        };

        CONTROLSET.ENCODERS.valueSet.subscribe(onEncodersValueSetChanged, CONTROLSET.ENCODERS);
    }

    // == just some assertions against surprises

    lep.util.assert(SWITCHABLE_VALUESETS.indexOf(VALUESET.PARAM) === PARAMS_MODE_BTN_OFFSET_IN_FIRST_ROW,
        'PARAMS_MODE_BTN_OFFSET_IN_FIRST_ROW must match VALUESET.PARAM\'s position inside SWITCHABLE_VALUESETS',
        PARAMS_MODE_BTN_OFFSET_IN_FIRST_ROW);

    // ====================== Init ======================

    initPreferences();
    transport.addIsPlayingObserver(HANDLERS.PLAYING_STATUS_CHANGED);
    eventDispatcher.onNotePressed(NOTE_ACTION.NEXT_DEVICE_OR_CHANNEL_PAGE, HANDLERS.NEXT_DEVICE_OR_CHANNEL_PAGE);
    eventDispatcher.onNotePressed(NOTE_ACTION.PREV_DEVICE_OR_CHANNEL_PAGE, HANDLERS.PREV_DEVICE_OR_CHANNEL_PAGE);

    flushDispatcher.onFirstFlush(function() {
        initTransportButtons();
        initEncoderLedRingsModeSwitching();
        initMainFader();

        buttonMode(XT_BUTTON_MODE.VALUETYPE);

        XT_BUTTON_MODE.SELECT.valueSet = VALUESET.SELECT;
        XT_BUTTON_MODE.ARM.valueSet = VALUESET.ARM;
        XT_BUTTON_MODE.VALUETYPE.valueSet = VALUETYPE_SELECTOR_VALUESET;

        CONTROLSET.TOP_BUTTONS.setObservableValueSet(ko.computed(function() {
            return buttonMode().valueSet;
        }));

        CONTROLSET.ENCODERS.valueSet(VALUESET.VOLUME);

        // TODO move functionality to proper place
        // eventDispatcher.onNotePressed(NOTE.FIRST_BOTTOM_BTN + 6, VALUESET.PARAM.gotoDevice, null, MIDI_CHANNEL);

        println('\n-------------\nX-Touch Mini ready');
    });

    println('\n-------------\nX-Touch Mini waiting for first flush...');
};

function exit() {
}