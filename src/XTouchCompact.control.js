/**
 * Bitwig Controller Script for the Behringer X-Touch Compact.
 *
 * Author: Lennart Pegel - https://github.com/justlep/bitwig
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 */

loadAPI(6);
load('lep/api.js');

host.defineController('Behringer', 'X-Touch Compact', '0.1', '58169cfc-2228-11e8-b467-0ed5f89f718b', 'Lennart Pegel');
host.defineMidiPorts(1, 1);
host.addDeviceNameBasedDiscoveryPair(['X-TOUCH COMPACT'], ['X-TOUCH COMPACT']);

function init() {
    lep.setLogLevel(lep.LOGLEVEL.DEBUG);
    new lep.XTouchCompact(0);
}

/**
 * @constructor
 * @param {number} xtcMidiChannel - XTouchCompact MIDI channel (0-based)
 */
lep.XTouchCompact = function(xtcMidiChannel) {
    lep.util.assertNumberInRange(xtcMidiChannel, 0, 15, 'Invalid xtcMidiChannel for XTouchCompact');

    const MIDI_CHANNEL = xtcMidiChannel;

    host.getNotificationSettings().getUserNotificationsEnabled().set(true);

    var WINDOW_SIZE = 8,
        SENDS_NUMBER = 1,
        USER_CONTROL_PAGES = 6,
        prefs = {
            soloExclusive: true
        },
        CC = {
            TOP_ENCODER: 10,
            FIRST_FADER_MOVE: 1,
            FIRST_FADER_TOUCH: 101,
            MASTER_FADER_MOVE: 9,
            MASTER_FADER_TOUCH: 109,
            RIGHT_ENCODER: 18
        },
        NOTE = {
            BTN_TOP1_FIRST: 16,
            BTN_TOP2_FIRST: 24,
            BTN_TOP3_FIRST: 32,
            ENC_TOP_FIRST_CLICK: 0,
            ENC_RIGHT_FIRST_CLICK: 8,
            BTN_BOTTOM_FIRST: 40,
            BTN_LOOP: 51,
            BTN_RECORD: 52,
            BTN_REWIND: 49,
            BTN_FORWARD: 50,
            BTN_STOP: 53,
            BTN_PLAY: 54,
            BTN_MAIN: 48
        },
        NOTE_ACTION = {
            MODE_SOLO_MUTE: NOTE.BTN_TOP2_FIRST,
            MODE_ARM_SELECT: NOTE.BTN_TOP2_FIRST + 1,
            MODE_VALUE_SELECT: NOTE.BTN_TOP2_FIRST + 2,
            MODE_VALUE_PAGE_SELECT: NOTE.BTN_TOP2_FIRST + 3,
            SHIFT: NOTE.BTN_MAIN,
            RECORD: NOTE.BTN_RECORD,
            LOOP: NOTE.BTN_LOOP,
            PREV_DEVICE_OR_CHANNEL_PAGE: NOTE.BTN_REWIND,
            NEXT_DEVICE_OR_CHANNEL_PAGE: NOTE.BTN_FORWARD,
            PUNCH_IN: NOTE.BTN_TOP2_FIRST + 6,
            PUNCH_OUT: NOTE.BTN_TOP2_FIRST + 7,
            PLAY: NOTE.BTN_PLAY,
            STOP_MUTE_FADERS: NOTE.BTN_STOP
        },

        transport = lep.util.getTransport(),
        trackBank = host.createMainTrackBank(WINDOW_SIZE, SENDS_NUMBER, 0),
        cursorDevice = host.createEditorCursorDevice(0),
        eventDispatcher = lep.MidiEventDispatcher.getInstance(),
        trackWindow = new lep.TrackWindow('Tracks', 8, 0, 0, trackBank),
        masterTrack = host.createMasterTrack(0),
        isShiftPressed = ko.observable(false).updatedBy(function(obs) {
            eventDispatcher.onNote(NOTE_ACTION.SHIFT, function(noteOrCc, velocity /*, channel*/) {
                obs(!!velocity);
            }, null, MIDI_CHANNEL);
        }),
        clearPunchOnStop = ko.observable(true),

        HANDLERS = {
            NEXT_DEVICE_OR_CHANNEL_PAGE: function() {
                if (isShiftPressed()) {
                    cursorDevice.selectNext();
                } else {
                    trackWindow.moveChannelPageForth();
                }
            },
            PREV_DEVICE_OR_CHANNEL_PAGE: function() {
                if (isShiftPressed()) {
                    cursorDevice.selectPrevious();
                } else {
                    trackWindow.moveChannelPageBack();
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

        VALUESET = {
            VOLUME: lep.ValueSet.createVolumeValueSet(trackBank, WINDOW_SIZE),
            PAN:    lep.ValueSet.createPanValueSet(trackBank, WINDOW_SIZE),
            SEND:   lep.SendsValueSet.createFromTrackBank(trackBank),
            SEND2:   lep.SendsValueSet.createFromTrackBank(trackBank),
            PARAM:  new lep.ParamsValueSet(cursorDevice),
            USERCONTROL: lep.ValueSet.createUserControlsValueSet(USER_CONTROL_PAGES, WINDOW_SIZE, 'XTC-UC-{}-{}'),
            SOLO:   lep.ValueSet.createSoloValueSet(trackBank, WINDOW_SIZE, prefs),
            ARM:    lep.ValueSet.createArmValueSet(trackBank, WINDOW_SIZE),
            MUTE:   lep.ValueSet.createMuteValueSet(trackBank, WINDOW_SIZE),
            SELECT: lep.ValueSet.createSelectValueSet(trackBank, WINDOW_SIZE)
        },

        SWITCHABLE_VALUESETS = [
            VALUESET.VOLUME,
            VALUESET.PAN,
            VALUESET.SEND,
            VALUESET.SEND2,
            VALUESET.PARAM,
            VALUESET.USERCONTROL
        ],
        VALUE = {
            MASTER_VOLUME: new lep.StandardRangedValue({
                name: 'MasterVol',
                rangedValue: masterTrack.volume()
            })
        },
        // getNextFreeSwitchableValueSet = function() {
        //     for (var i = 0, valueSet; i < SWITCHABLE_VALUESETS.length; i++) {
        //         valueSet = SWITCHABLE_VALUESETS[i];
        //         if (!valueSet.isControlled()) {
        //             return valueSet;
        //         }
        //     }
        //     return null;
        // },
        /**
         * Observable holding the VALUE_SET.* that is currently assigned to the encoders.
         * When setting a valueSet that is already used by the faders, the valueSets of faders/encoders will be swapped.
         */
        currentEncoderValueSetObservable = (function(){
            var _valueSet = ko.observable();
            return ko.computed({
                read: _valueSet,
                write: function(newValueSet) {
                    lep.util.assertValueSet(newValueSet, 'Invalid valueSet for currentEncoderValueSetObservable');
                    var oldValueSet = _valueSet(),
                        otherObservable = currentFaderValueSetObservable;
                    _valueSet(newValueSet);
                    CONTROLSET.ENCODERS.setValueSet(newValueSet);
                    if (newValueSet === otherObservable()) {
                        otherObservable(oldValueSet);
                    }
                }
            });
        })(),
        /**
         * Observable holding the VALUE_SET.* that is currently assigned to the faders.
         * When setting a valueSet that is already used by the encoders, the valueSets of faders/encoders will be swapped.
         */
        currentFaderValueSetObservable = (function(){
            var _valueSet = ko.observable();
            return ko.computed({
                read: _valueSet,
                write: function(newValueSet) {
                    lep.util.assertValueSet(newValueSet, 'Invalid valueSet for currentFaderValueSetObservable');
                    var oldValueSet = _valueSet(),
                        otherObservable = currentEncoderValueSetObservable;
                    _valueSet(newValueSet);
                    CONTROLSET.FADERS.setValueSet(newValueSet);
                    if (newValueSet === otherObservable()) {
                        otherObservable(oldValueSet);
                    }
                }
            });
        })(),

        CONTROLSET = {
            ENCODERS: new lep.ControlSet('ClickEncoders', WINDOW_SIZE, function(index) {
                return new lep.ClickEncoder({
                    name: 'ClickEncoder' + index,
                    valueCC: CC.TOP_ENCODER + index,
                    clickNote: NOTE.ENC_TOP_FIRST_CLICK + index,
                    midiChannel: MIDI_CHANNEL
                });
            }),
            FADERS: new lep.ControlSet('Faders', WINDOW_SIZE, function(index) {
                return new lep.Fader({
                    name: 'Fader' + index,
                    valueCC: CC.FIRST_FADER_MOVE + index,
                    midiChannel: MIDI_CHANNEL
                });
            }),
            UPPER_BUTTONS: new lep.ControlSet('Upper Buttons', WINDOW_SIZE, function(index) {
                return new lep.Button({
                    name: 'UpperBtn' + index,
                    clickNote: NOTE.BTN_TOP1_FIRST + index,
                    midiChannel: MIDI_CHANNEL
                });
            }),
            LOWER_BUTTONS: new lep.ControlSet('Lower Buttons', WINDOW_SIZE, function(index) {
                return new lep.Button({
                    name: 'LowerBtn' + index,
                    clickNote: NOTE.BTN_TOP3_FIRST + index,
                    midiChannel: MIDI_CHANNEL
                });
            })
        },

        /**
         * ValueSets for the buttons selecting which value type (volume, pan etc) is assigned to the encoders/faders.
         * (!) The last two buttons do NOT repesent value *type* but the -/+ buttons for the active value *PAGE*
         */
        VALUETYPE_BTN_VALUESET = {
            _assertion: lep.util.assert(SWITCHABLE_VALUESETS.length <= WINDOW_SIZE-2, 'There are more value types than encoder buttons!'),
            FOR_ENCODERS: new lep.ValueSet('EncoderValueTypeSelect', WINDOW_SIZE, 1, function(index) {
                var isPrevPageIndex = (index === WINDOW_SIZE-2),
                    isNextPageBtn = (index === WINDOW_SIZE-1),
                    switchableValueSet = !isPrevPageIndex && !isNextPageBtn && SWITCHABLE_VALUESETS[index];

                if (isPrevPageIndex) {
                    return new lep.KnockoutSyncedValue({
                        name: 'EncoderPrevValuePageBtn',
                        ownValue: true,
                        refObservable: CONTROLSET.ENCODERS.hasPrevValuePage,
                        onClick: CONTROLSET.ENCODERS.prevValuePage
                    });
                }
                if (isNextPageBtn) {
                    return new lep.KnockoutSyncedValue({
                        name: 'EncoderNextValuePageBtn',
                        ownValue: true,
                        refObservable: CONTROLSET.ENCODERS.hasNextValuePage,
                        onClick: CONTROLSET.ENCODERS.nextValuePage
                    });
                }
                if (switchableValueSet) {
                    return new lep.KnockoutSyncedValue({
                        name: 'EncoderValueTypeSelect-' + switchableValueSet.name,
                        ownValue: switchableValueSet,
                        refObservable: currentEncoderValueSetObservable
                    });
                }
            }),
            FOR_FADERS: new lep.ValueSet('FaderValueTypeSelect', WINDOW_SIZE, 1, function(index) {
                lep.util.assert(SWITCHABLE_VALUESETS.length);
                var isPrevPageIndex = (index === WINDOW_SIZE-2),
                    isNextPageBtn = (index === WINDOW_SIZE-1),
                    switchableValueSet = !isPrevPageIndex && !isNextPageBtn && SWITCHABLE_VALUESETS[index];

                if (isPrevPageIndex) {
                    return new lep.KnockoutSyncedValue({
                        name: 'FaderPrevValuePageBtn',
                        ownValue: true,
                        refObservable: CONTROLSET.FADERS.hasPrevValuePage,
                        onClick: CONTROLSET.FADERS.prevValuePage
                    });
                }
                if (isNextPageBtn) {
                    return new lep.KnockoutSyncedValue({
                        name: 'FaderNextValuePageBtn',
                        ownValue: true,
                        refObservable: CONTROLSET.FADERS.hasNextValuePage,
                        onClick: CONTROLSET.FADERS.nextValuePage
                    });
                }
                if (switchableValueSet) {
                    return new lep.KnockoutSyncedValue({
                        name: 'FaderValueTypeSelect-' + switchableValueSet.name,
                        ownValue: switchableValueSet,
                        refObservable: currentFaderValueSetObservable
                    });
                }
            })
        },

        /**
         * ValueSets for the buttons selecting which value PAGE is active in the currently
         * attached valueSet of to the encoders/faders.
         */
        VALUEPAGE_BTN_VALUESET = {
            FOR_ENCODERS: new lep.ValueSet('EncoderValuePageSelect', WINDOW_SIZE, 1, function(index) {
                if (index >= WINDOW_SIZE-2) {
                    var prevOrNextValuePageBtnValue = VALUETYPE_BTN_VALUESET.FOR_ENCODERS.values[index];
                    lep.util.assert(prevOrNextValuePageBtnValue && prevOrNextValuePageBtnValue instanceof lep.KnockoutSyncedValue,
                        'Unexpected type for VALUETYPE_BTN_VALUESET.FOR_ENCODERS.values[{}]', index);
                    return prevOrNextValuePageBtnValue;
                }
                return new lep.KnockoutSyncedValue({
                    name: 'EncoderValuePageSelect-' + index,
                    ownValue: index,
                    refObservable: CONTROLSET.ENCODERS.valuePage
                });
            }),
            FOR_FADERS: new lep.ValueSet('FaderValuePageSelect', WINDOW_SIZE, 1, function(index) {
                if (index >= WINDOW_SIZE-2) {
                    var prevOrNextValuePageBtnValue = VALUETYPE_BTN_VALUESET.FOR_FADERS.values[index];
                    lep.util.assert(prevOrNextValuePageBtnValue && prevOrNextValuePageBtnValue instanceof lep.KnockoutSyncedValue,
                        'Unexpected type for VALUETYPE_BTN_VALUESET.FOR_FADERS.values[{}]', index);
                    return prevOrNextValuePageBtnValue;
                }
                return new lep.KnockoutSyncedValue({
                    name: 'FaderValuePageSelect-' + index,
                    ownValue: index,
                    refObservable: CONTROLSET.FADERS.valuePage
                });
            })
        },

        currentEncoderGroupMode = (function(){
            var _currentEncoderGroupMode = ko.observable();
            return ko.computed({
                read: _currentEncoderGroupMode,
                write: function(newGroupModeKey) {
                    lep.util.assertObject(ENCODER_GROUPS[newGroupModeKey], 'Unknown encoder groupModeKey: {}', newGroupModeKey);
                    lep.logDebug('Switching encoderGroupMode to "{}"', newGroupModeKey);
                    _currentEncoderGroupMode(newGroupModeKey);

                    var buttonValueSets = ENCODER_GROUPS[newGroupModeKey].BUTTON_VALUESETS,
                        lowerButtonValueSet = buttonValueSets.lower;

                    if (buttonValueSets.upper) {
                        CONTROLSET.UPPER_BUTTONS.setValueSet(buttonValueSets.upper);
                    }
                    if (lowerButtonValueSet) {
                        CONTROLSET.LOWER_BUTTONS.setValueSet(lowerButtonValueSet);
                    }
                }
            });
        })(),

        createGroupModeBtnValue = function(modeKey, valueName) {
            return new lep.KnockoutSyncedValue({
                name: valueName,
                ownValue: modeKey,
                refObservable: currentEncoderGroupMode,
                restoreRefAfterLongClick: true
            });
        },
        ENCODER_GROUPS = {
            SOLO_MUTE: {
                MODE_BTN_VALUE: createGroupModeBtnValue('SOLO_MUTE', 'Mode Solo/Mute'),
                BUTTON_VALUESETS: {upper: VALUESET.SOLO, lower: VALUESET.MUTE}
            },
            ARM_SELECT: {
                MODE_BTN_VALUE: createGroupModeBtnValue('ARM_SELECT', 'Mode Arm/Select'),
                BUTTON_VALUESETS: {upper: VALUESET.ARM, lower: VALUESET.SELECT}
            },
            VALUE_TYPE: {
                MODE_BTN_VALUE: createGroupModeBtnValue('VALUE_TYPE', 'Mode ValueType'),
                BUTTON_VALUESETS: {upper: VALUETYPE_BTN_VALUESET.FOR_ENCODERS, lower: VALUETYPE_BTN_VALUESET.FOR_FADERS}
            },
            VALUE_PAGE: {
                MODE_BTN_VALUE: createGroupModeBtnValue('VALUE_PAGE', 'Mode ValuePage'),
                BUTTON_VALUESETS: {upper: VALUEPAGE_BTN_VALUESET.FOR_ENCODERS, lower: VALUEPAGE_BTN_VALUESET.FOR_FADERS}
            }
        },

        initEncoderModeButtons = function() {
            new lep.Button({
                name: 'Mode Solo/Mute Btn',
                clickNote: NOTE_ACTION.MODE_SOLO_MUTE,
                midiChannel: MIDI_CHANNEL,
                valueToAttach: ENCODER_GROUPS.SOLO_MUTE.MODE_BTN_VALUE
            });
            new lep.Button({
                name: 'Mode Arm/Select Btn',
                clickNote: NOTE_ACTION.MODE_ARM_SELECT,
                midiChannel: MIDI_CHANNEL,
                valueToAttach: ENCODER_GROUPS.ARM_SELECT.MODE_BTN_VALUE
            });
            new lep.Button({
                name: 'Mode ValueType Btn',
                clickNote: NOTE_ACTION.MODE_VALUE_SELECT,
                midiChannel: MIDI_CHANNEL,
                valueToAttach: ENCODER_GROUPS.VALUE_TYPE.MODE_BTN_VALUE
            });
            new lep.Button({
                name: 'Mode ValuePage Btn',
                clickNote: NOTE_ACTION.MODE_VALUE_PAGE_SELECT,
                midiChannel: MIDI_CHANNEL,
                valueToAttach: ENCODER_GROUPS.VALUE_PAGE.MODE_BTN_VALUE
            });
            currentEncoderGroupMode('VALUE_TYPE');
        },
        TRANSPORT_VALUE = {
            PLAY: lep.ToggledTransportValue.getPlayInstance(),
            RECORD: lep.ToggledTransportValue.getRecordInstance(),
            ARRANGER_AUTOMATION: lep.ToggledTransportValue.getArrangerAutomationInstance(),
            LOOP: lep.ToggledTransportValue.getLoopInstance(),
            METRONOME: lep.ToggledTransportValue.getMetronomeInstance(),
            OVERDUB: lep.ToggledTransportValue.getOverdubInstance(),
            PUNCH_IN: lep.ToggledTransportValue.getPunchInInstance(),
            PUNCH_OUT: lep.ToggledTransportValue.getPunchOutInstance(),
            CLEAR_PUNCH_ON_STOP: new lep.KnockoutSyncedValue({
                name: 'ClearPunchInOutOnStop',
                ownValue: true,
                refObservable: clearPunchOnStop,
                onClick: function() {
                    clearPunchOnStop(!clearPunchOnStop());
                }
            })
        },
        CONTROL = {
            MASTER_FADER: new lep.Fader({
                name: 'MasterFader',
                valueCC: CC.MASTER_FADER_MOVE,
                midiChannel: MIDI_CHANNEL
            })
        };

    function initPreferences() {
        var preferences = host.getPreferences();
        var soloExclusiveValue = preferences.getEnumSetting('SOLO Exlusive', 'Preferences', ['ON','OFF'], 'OFF');
        soloExclusiveValue.addValueObserver(function(newValue) {
            prefs.soloExclusive = (newValue === 'ON');
            lep.logDebug('Toggled SOLO EXCLUSIVE {}', prefs.soloExclusive);
        });
    }

    function initTransportButtons() {
        new lep.Button({
            name: 'PlayBtn',
            clickNote: NOTE_ACTION.PLAY,
            midiChannel: MIDI_CHANNEL,
            valueToAttach: TRANSPORT_VALUE.PLAY
        });
        new lep.Button({
            name: 'RecordBtn',
            clickNote: NOTE_ACTION.RECORD,
            midiChannel: MIDI_CHANNEL,
            valueToAttach: ko.computed(function() {
                return isShiftPressed() ? TRANSPORT_VALUE.ARRANGER_AUTOMATION : TRANSPORT_VALUE.RECORD;
            })
        });
        new lep.Button({
            name: 'PunchInBtn',
            clickNote: NOTE_ACTION.PUNCH_IN,
            midiChannel: MIDI_CHANNEL,
            valueToAttach: ko.computed(function() {
                return isShiftPressed() ? TRANSPORT_VALUE.OVERDUB : TRANSPORT_VALUE.PUNCH_IN;
            })
        });
        new lep.Button({
            name: 'PunchOutBtn',
            clickNote: NOTE_ACTION.PUNCH_OUT,
            midiChannel: MIDI_CHANNEL,
            valueToAttach: ko.computed(function() {
                return isShiftPressed() ? TRANSPORT_VALUE.CLEAR_PUNCH_ON_STOP : TRANSPORT_VALUE.PUNCH_OUT;
            })
        });
        new lep.Button({
            name: 'LoopBtn',
            clickNote: NOTE_ACTION.LOOP,
            midiChannel: MIDI_CHANNEL,
            valueToAttach: ko.computed(function() {
                return isShiftPressed() ? TRANSPORT_VALUE.METRONOME : TRANSPORT_VALUE.LOOP;
            })
        });
        new lep.Button({
            name: 'StopBtn',
            clickNote: NOTE_ACTION.STOP_MUTE_FADERS,
            midiChannel: MIDI_CHANNEL,
            valueToAttach: new lep.KnockoutSyncedValue({
                name: 'Stop/MuteFaders',
                ownValue: true,
                refObservable: ko.computed(function(){
                    return isShiftPressed() && !CONTROLSET.FADERS.muted();
                }),
                onClick: function() {
                    if (isShiftPressed()) {
                        CONTROLSET.FADERS.muted.toggle();
                        CONTROL.MASTER_FADER.setMuted(CONTROLSET.FADERS.muted.peek());
                    } else {
                        transport.stop();
                    }
                }
            })
        });
    }

    // ====================== Init ======================

    initPreferences();
    transport.addIsPlayingObserver(HANDLERS.PLAYING_STATUS_CHANGED);
    eventDispatcher.onNotePressed(NOTE_ACTION.NEXT_DEVICE_OR_CHANNEL_PAGE, HANDLERS.NEXT_DEVICE_OR_CHANNEL_PAGE);
    eventDispatcher.onNotePressed(NOTE_ACTION.PREV_DEVICE_OR_CHANNEL_PAGE, HANDLERS.PREV_DEVICE_OR_CHANNEL_PAGE);

    lep.util.onFirstFlush(function() {
        initTransportButtons();
        initEncoderModeButtons();
        currentEncoderValueSetObservable(VALUESET.PAN);
        currentFaderValueSetObservable(VALUESET.VOLUME);
        CONTROL.MASTER_FADER.attachValue(VALUE.MASTER_VOLUME);
        println('\n-------------\nX-Touch Compact ready');
    });

    println('\n-------------\nX-Touch Compact waiting for first flush...');
};

function exit() {
}