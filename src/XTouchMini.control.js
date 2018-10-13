/**
 * Bitwig Controller Script for the Behringer X-Touch Mini.
 *
 * Author: Lennart Pegel - https://github.com/justlep/bitwig
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 */

loadAPI(6);
load('lep-framework/complete.js');

host.defineController('Behringer', 'X-Touch Mini', '1.1', '78370722-cd92-11e8-a8d5-f2801f1b9fd1', 'Lennart Pegel');
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
        TRANSPORT_BUTTONS_WINDOW_SIZE = 6,
        TRANSPORT_BUTTON_NAMES = ['Rwd', 'Fwd', 'Loop', 'Stop', 'Play', 'Rec'],
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
            TRANSPORT_BUTTONS_MODE: NOTE.FIRST_BOTTOM_BTN + 1,
            TRANSPORT_BUTTONS_MODE_GLOBAL: NOTE.FIRST_BOTTOM_BTN_GLOBAL + 1,
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
        READONLY_FALSE_COMPUTED = ko.computed({
            read: ko.observable(false),
            write: lep.util.NOP
        }),
        encoderValueSet = ko.observable(),
        topButtonsValueSet = ko.observable(),
        transportButtonsValueSet = ko.observable();

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
        clearPunchOnStop = ko.toggleableObservable(false);

    var HANDLERS = {
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
        };

    var CONTROLSET = {
            ENCODERS: new lep.ControlSet('TopEncoders', WINDOW_SIZE, function(index) {
                return new lep.ClickEncoder({
                    name: 'TopEncoder' + index,
                    valueCC: CC.FIRST_ENCODER + index,
                    clickNote: NOTE.FIRST_ENCODER_CLICK + index,
                    midiChannel: MIDI_CHANNEL
                });
            }),
            TOP_BUTTONS: new lep.ControlSet('TopButtons', WINDOW_SIZE, function(index) {
                return new lep.Button({
                    name: 'TopBtn' + index,
                    clickNote: NOTE.FIRST_TOP_BTN + index,
                    midiChannel: MIDI_CHANNEL,
                    midiChannel4Sync: GLOBAL_MIDI_CHANNEL,
                    clickNote4Sync: NOTE.FIRST_TOP_BTN_GLOBAL + index
                });
            }),
            /**
             * The 6(!) lower transport buttons (<< >> LOOP STOP PLAY RECORD)
             */
            TRANSPORT_BUTTONS: new lep.ControlSet('BottomButtons', TRANSPORT_BUTTONS_WINDOW_SIZE, function(index) {
                return new lep.Button({
                    name: TRANSPORT_BUTTON_NAMES[index] + 'Btn',
                    clickNote: NOTE.BTN_REWIND + index,
                    clickNote4Sync: NOTE.BTN_REWIND_GLOBAL + index,
                    midiChannel: MIDI_CHANNEL,
                    midiChannel4Sync: GLOBAL_MIDI_CHANNEL
                });
            })
        };

    var TRANSPORT_VALUE = {
            REWIND: new lep.KnockoutSyncedValue({
                name: 'Rewind',
                ownValue: true,
                refObservable: READONLY_FALSE_COMPUTED,
                onClick: function(ownValue, refObs, isDoubleClick) {
                    if (isShiftPressed()) {
                        ENCODER_VALUESET.PARAM.selectPreviousDevice();
                    } else {
                        tracksView.moveChannelPageBack();
                    }
                }
            }),
            FORWARD: new lep.KnockoutSyncedValue({
                name: 'Forward',
                ownValue: true,
                refObservable: READONLY_FALSE_COMPUTED,
                onClick: function(ownValue, refObs, isDoubleClick) {
                    if (isShiftPressed()) {
                        ENCODER_VALUESET.PARAM.selectNextDevice();
                    } else {
                        tracksView.moveChannelPageForth();
                    }
                }
            }),
            PLAY: lep.ToggledTransportValue.getPlayInstance().withVelocities(BUTTON_VALUE.BLINK, BUTTON_VALUE.OFF),
            RECORD: lep.ToggledTransportValue.getRecordInstance().withVelocities(BUTTON_VALUE.ON, BUTTON_VALUE.OFF),
            ARRANGER_AUTOMATION: lep.ToggledTransportValue.getArrangerAutomationInstance().withVelocities(BUTTON_VALUE.ON, BUTTON_VALUE.OFF),
            LOOP: lep.ToggledTransportValue.getLoopInstance().withVelocities(BUTTON_VALUE.ON, BUTTON_VALUE.OFF),
            METRONOME: lep.ToggledTransportValue.getMetronomeInstance().withVelocities(BUTTON_VALUE.BLINK, BUTTON_VALUE.OFF),
            OVERDUB: lep.ToggledTransportValue.getOverdubInstance().withVelocities(BUTTON_VALUE.ON, BUTTON_VALUE.OFF),
            PUNCH_IN: lep.ToggledTransportValue.getPunchInInstance().withVelocities(BUTTON_VALUE.ON, BUTTON_VALUE.OFF),
            PUNCH_OUT: lep.ToggledTransportValue.getPunchOutInstance().withVelocities(BUTTON_VALUE.ON, BUTTON_VALUE.OFF),
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
        };

    var ENCODER_VALUESET = {
            VOLUME: lep.ValueSet.createVolumeValueSet(trackBank, WINDOW_SIZE),
            PAN:    lep.ValueSet.createPanValueSet(trackBank, WINDOW_SIZE),
            SEND:   lep.SendsValueSet.createFromTrackBank(trackBank),
            SELECTED_TRACK_SENDS: new lep.SelectedTrackSendsValueSet(WINDOW_SIZE),
            PARAM:  new lep.ParamsValueSet(),
            USERCONTROL: lep.ValueSet.createUserControlsValueSet(USER_CONTROL_PAGES, WINDOW_SIZE, 'XTC-UC-{}-{}')
        };

    var TOP_BUTTON_VALUESET = {
            SOLO:   lep.ValueSet.createSoloValueSet(trackBank, WINDOW_SIZE, prefs),
            ARM:    lep.ValueSet.createArmValueSet(trackBank, WINDOW_SIZE),
            MUTE:   lep.ValueSet.createMuteValueSet(trackBank, WINDOW_SIZE),
            SELECT: lep.ValueSet.createSelectValueSet(trackBank, WINDOW_SIZE)
        };

    var TRANSPORT_BTN_VALUESET = {};

        /**
         * The valuesets as they are distributed over the top-row buttons for selecting what's currently controlled by the rotary encoders.
         */
    var SWITCHABLE_ENCODER_VALUESETS = [
            ENCODER_VALUESET.VOLUME,
            ENCODER_VALUESET.PAN,
            ENCODER_VALUESET.SEND,
            ENCODER_VALUESET.SELECTED_TRACK_SENDS,
            ENCODER_VALUESET.PARAM,
            ENCODER_VALUESET.USERCONTROL
        ],
        VALUE = {
            MASTER_VOLUME: lep.StandardRangedValue.createMasterVolumeValue(true),
            METRONOME_VOLUME: lep.StandardRangedValue.createMetronomeVolumeValue(true),
            CLEAR_PUNCH_ON_STOP: new lep.KnockoutSyncedValue({
                name: 'ClearPunchInOutOnStop',
                ownValue: true,
                refObservable: clearPunchOnStop,
                velocityValueOn: BUTTON_VALUE.BLINK,
                onClick: clearPunchOnStop.toggle
            })
        };

    /**
     * ValueSet for the buttons selecting which value type (volume, pan etc) is assigned to the encoders/faders.
     * (!) The last two buttons do NOT represent value *type* but the -/+ buttons for the active value *PAGE*
     */
    TOP_BUTTON_VALUESET.VALUETYPE = (function() {
        var namePrefix = 'TopEncoders',
            targetControlSet = CONTROLSET.ENCODERS;

        lep.util.assert(SWITCHABLE_ENCODER_VALUESETS.length, 'no valuetypes to swtich between?');

        return new lep.ValueSet(namePrefix + 'ValueTypeSelector', WINDOW_SIZE, 1, function(index) {
            var isPrevPageIndex = (index === WINDOW_SIZE-2),
                isNextPageBtn = (index === WINDOW_SIZE-1),
                switchableValueSet = !isPrevPageIndex && !isNextPageBtn && SWITCHABLE_ENCODER_VALUESETS[index],
                isParamsValueSet = switchableValueSet === ENCODER_VALUESET.PARAM,
                isUserControlValueSet = switchableValueSet === ENCODER_VALUESET.USERCONTROL,
                isTrackSends = switchableValueSet === ENCODER_VALUESET.SELECTED_TRACK_SENDS,
                isLockableValueSet = isParamsValueSet || isTrackSends;

            if (isPrevPageIndex) {
                return new lep.KnockoutSyncedValue({
                    name: namePrefix + 'PrevValuePage',
                    ownValue: true,
                    refObservable: targetControlSet.hasPrevValuePage,
                    onClick: function() {
                        if (isParamsModeBtnPressed.peek()) {
                            ENCODER_VALUESET.PARAM.lockedToPage.toggle();
                        } else {
                            targetControlSet.prevValuePage();
                        }
                    },
                    computedVelocity: function() {
                        var canSwitchPage = this.refObservable(),
                            isSwitchableLockedParamsPage = canSwitchPage &&
                                (targetControlSet.valueSet() === ENCODER_VALUESET.PARAM) &&
                                ENCODER_VALUESET.PARAM.lockedToPage();
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
                            ENCODER_VALUESET.PARAM.gotoDevice();
                            ENCODER_VALUESET.PARAM.toggleRemoteControlsSection();
                        } else {
                            targetControlSet.nextValuePage();
                        }
                    },
                    computedVelocity: function() {
                        var canSwitchPage = this.refObservable(),
                            isSwitchableLockedParamsPage = canSwitchPage && (targetControlSet.valueSet() === ENCODER_VALUESET.PARAM) &&
                                ENCODER_VALUESET.PARAM.lockedToPage();
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
                            ENCODER_VALUESET.PARAM.toggleDeviceWindow();
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

    /**
     * The buttons values determining the current value page of the valueset currently assigned to the top encoders.
     * @type {lep.ValueSet}
     */
    TOP_BUTTON_VALUESET.VALUEPAGE = new lep.ValueSet('EncoderValuePageSelect', WINDOW_SIZE, 1, function(index) {
        if (index >= WINDOW_SIZE-2) {
            var prevOrNextValuePageBtnValue = TOP_BUTTON_VALUESET.VALUETYPE.values[index];
            lep.util.assert(prevOrNextValuePageBtnValue && prevOrNextValuePageBtnValue instanceof lep.KnockoutSyncedValue,
                            'Unexpected type for TOP_BUTTON_VALUESET.VALUETYPE.values[{}]', index);
            return prevOrNextValuePageBtnValue;
        }
        return new lep.KnockoutSyncedValue({
            name: 'EncoderValuePageSelect-' + index,
            ownValue: index,
            computedVelocity: function() {
                var currentPage = CONTROLSET.ENCODERS.valuePage(),
                    light = (currentPage % (WINDOW_SIZE-2)) === index;
                return  light ? BUTTON_VALUE.ON : BUTTON_VALUE.OFF;
            },
            refObservable: CONTROLSET.ENCODERS.valuePage
        });
    });

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

    var SWITCHABLE_TOP_BUTTON_VALUESETS = [
        TOP_BUTTON_VALUESET.VALUETYPE,
        TOP_BUTTON_VALUESET.VALUEPAGE,
        TOP_BUTTON_VALUESET.SELECT,
        TOP_BUTTON_VALUESET.MUTE,
        TOP_BUTTON_VALUESET.SOLO,
        TOP_BUTTON_VALUESET.ARM
    ];

    TRANSPORT_BTN_VALUESET.TOP_BUTTON_MODE = new lep.ValueSet('TopButtonModeValues', TRANSPORT_BUTTONS_WINDOW_SIZE, 1, function(index) {
        var ownValueSet = SWITCHABLE_TOP_BUTTON_VALUESETS[index];
        return new lep.KnockoutSyncedValue({
            name: 'TopBtnModeSelect-' + ownValueSet.name,
            ownValue: ownValueSet,
            refObservable: topButtonsValueSet,
            velocityValueOn: BUTTON_VALUE.ON,
            velocityValueOff: BUTTON_VALUE.OFF,
            restoreRefAfterLongClick: true
        });
    });

    TRANSPORT_BTN_VALUESET.TRANSPORT = new lep.ValueSet('TransportValues', TRANSPORT_BUTTONS_WINDOW_SIZE, 1, function(index) {
        switch (index) {
            case 0: return TRANSPORT_VALUE.REWIND;
            case 1: return TRANSPORT_VALUE.FORWARD;
            case 2: return TRANSPORT_VALUE.LOOP;
            case 3: return TRANSPORT_VALUE.STOP;
            case 4: return TRANSPORT_VALUE.PLAY;
            case 5: return TRANSPORT_VALUE.RECORD;
        }
        throw 'Invalid index for ENCODER_VALUESET.TRANSPORT';
    });

    TRANSPORT_BTN_VALUESET.CONFIG = new lep.ValueSet('ConfigValues', TRANSPORT_BUTTONS_WINDOW_SIZE, 1, function(index) {
        switch (index) {
            case 0: return TRANSPORT_VALUE.REWIND;
            case 1: return TRANSPORT_VALUE.FORWARD;
            case 2: return TRANSPORT_VALUE.METRONOME;
            case 3: return VALUE.CLEAR_PUNCH_ON_STOP; // TODO maybe something nicer here?
            case 4: return TRANSPORT_VALUE.OVERDUB;
            case 5: return TRANSPORT_VALUE.ARRANGER_AUTOMATION;
        }
        throw 'Invalid index for ConfigValues';
    });

    new lep.Button({
        name: 'TransportButtonsModeBtn',
        clickNote: NOTE_ACTION.TRANSPORT_BUTTONS_MODE,
        clickNote4Sync: NOTE_ACTION.TRANSPORT_BUTTONS_MODE_GLOBAL,
        midiChannel: MIDI_CHANNEL,
        midiChannel4Sync: GLOBAL_MIDI_CHANNEL,
        valueToAttach: new lep.KnockoutSyncedValue({
            name: 'TransportButtonsModeBtnValue',
            ownValue: TRANSPORT_BTN_VALUESET.TOP_BUTTON_MODE,
            refObservable: transportButtonsValueSet,
            restoreRefAfterLongClick: true,
            isOnClickRestoreable: true,
            velocityValueOn: BUTTON_VALUE.BLINK,
            onClick: function(ownValue, refObs) {
                var newValueSet = (ownValue === refObs.peek()) ? TRANSPORT_BTN_VALUESET.TRANSPORT : ownValue;
                //lep.logDev('new valueset for transport buttons: ' + newValueSet.name);
                refObs(newValueSet);
            }
        })
    });

    /**
     * Switch the LED ring display mode of the encoders depending on the value type it is currently attached to
     */
    function initEncoderLedRingsModeSwitching() {
        var currentLedMode;

        CONTROLSET.ENCODERS.valueSet.subscribe(function(newValueSet) {
            var newLedMode = (!newValueSet) ? currentLedMode :
                             (newValueSet === ENCODER_VALUESET.PAN) ? ENCODER_LED_MODE.TRIM : ENCODER_LED_MODE.FAN;

            if (newLedMode !== currentLedMode) {
                lep.logDebug('Setting LED mode of {} to {}', this.name, newLedMode);
                for (var i = this.controls.length-1, cc; i >= 0; i--) {
                    // encoder led mode global CCs equal the encoder CCs
                    cc = this.controls[i].valueCC4Sync;
                    sendChannelController(GLOBAL_MIDI_CHANNEL, cc, newLedMode);
                }
                currentLedMode = newLedMode;
            }
        }, CONTROLSET.ENCODERS);
    }

    // == just some assertions against surprises

    lep.util.assert(SWITCHABLE_ENCODER_VALUESETS.indexOf(ENCODER_VALUESET.PARAM) === PARAMS_MODE_BTN_OFFSET_IN_FIRST_ROW,
                    'PARAMS_MODE_BTN_OFFSET_IN_FIRST_ROW must match ENCODER_VALUESET.PARAM\'s position inside SWITCHABLE_ENCODER_VALUESETS',
                    PARAMS_MODE_BTN_OFFSET_IN_FIRST_ROW);

    // ====================== Init ======================

    initPreferences();
    transport.addIsPlayingObserver(HANDLERS.PLAYING_STATUS_CHANGED);

    flushDispatcher.onFirstFlush(function() {
        initEncoderLedRingsModeSwitching();
        initMainFader();

        topButtonsValueSet.effective = ko.computed(function() {
            return isShiftPressed() ? TOP_BUTTON_VALUESET.VALUETYPE : topButtonsValueSet();
        });
        topButtonsValueSet(TOP_BUTTON_VALUESET.VALUETYPE);
        CONTROLSET.TOP_BUTTONS.setObservableValueSet(topButtonsValueSet.effective);

        encoderValueSet.effective = encoderValueSet;
        encoderValueSet(ENCODER_VALUESET.VOLUME);
        CONTROLSET.ENCODERS.setObservableValueSet(encoderValueSet.effective);

        transportButtonsValueSet.effective = ko.computed(function() {
            return isShiftPressed() ? TRANSPORT_BTN_VALUESET.CONFIG : transportButtonsValueSet();
        });
        transportButtonsValueSet(TRANSPORT_BTN_VALUESET.TRANSPORT);
        CONTROLSET.TRANSPORT_BUTTONS.setObservableValueSet(transportButtonsValueSet.effective);

        // TODO move functionality to proper place
        // eventDispatcher.onNotePressed(NOTE.FIRST_BOTTOM_BTN + 6, ENCODER_VALUESET.PARAM.gotoDevice, null, MIDI_CHANNEL);

        println('\n-------------\nX-Touch Mini ready');
    });

    println('\n-------------\nX-Touch Mini waiting for first flush...');
};

function exit() {
}